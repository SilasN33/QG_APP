"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  LogOut, Trophy, Target, Layers, TrendingUp,
  Pencil, Check, X, ChevronDown, Camera, Loader2,
} from "lucide-react";
import { updateAvatarUrlAction, updatePlayerGroupAction, updatePlayerNameAction } from "@/lib/actions/updatePlayer";
import { cn } from "@/utils/cn";
import type { Player, Standing, GroupLetter } from "@/types";

interface Props {
  player:     Player;
  standing:   Standing | null;
  matchCount: number;
}

const GROUPS: { value: GroupLetter | null; label: string }[] = [
  { value: null, label: "Sem grupo" },
  { value: "A",  label: "Grupo A" },
  { value: "B",  label: "Grupo B" },
  { value: "C",  label: "Grupo C" },
  { value: "D",  label: "Grupo D" },
];

export function PerfilClient({ player, standing, matchCount }: Props) {
  const router = useRouter();

  const [editingName, setEditingName] = useState(false);
  const [nameValue,   setNameValue]   = useState(player.name);
  const [nameSaving,  setNameSaving]  = useState(false);
  const [nameError,   setNameError]   = useState<string | null>(null);

  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [groupValue,      setGroupValue]      = useState<GroupLetter | null>(player.group_letter);
  const [groupSaving,     setGroupSaving]     = useState(false);
  const [groupError,      setGroupError]      = useState<string | null>(null);
  const [groupSuccess,    setGroupSuccess]    = useState(false);

  const fileInputRef                            = useRef<HTMLInputElement>(null);
  const [avatarSrc,       setAvatarSrc]         = useState(player.avatar_url);
  const [avatarUploading, setAvatarUploading]   = useState(false);
  const [avatarError,     setAvatarError]       = useState<string | null>(null);

  const winRate = matchCount > 0 && standing
    ? Math.round((standing.wins / matchCount) * 100)
    : 0;

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function saveName() {
    if (!nameValue.trim()) return;
    setNameSaving(true);
    setNameError(null);
    const { error } = await updatePlayerNameAction(nameValue.trim());
    if (error) { setNameError(error); setNameSaving(false); return; }
    setEditingName(false);
    setNameSaving(false);
    router.refresh();
  }

  async function saveGroup(g: GroupLetter | null) {
    setGroupValue(g);
    setShowGroupPicker(false);
    setGroupSaving(true);
    setGroupError(null);
    setGroupSuccess(false);
    const { error } = await updatePlayerGroupAction(g);
    setGroupSaving(false);
    if (error) { setGroupError(error); return; }
    setGroupSuccess(true);
    setTimeout(() => setGroupSuccess(false), 2000);
    router.refresh();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext     = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const allowed = ["jpg", "jpeg", "png", "webp"];
    if (!allowed.includes(ext)) { setAvatarError("Use JPG, PNG ou WebP."); return; }
    if (file.size > 5 * 1024 * 1024) { setAvatarError("Máximo 5 MB."); return; }

    setAvatarUploading(true);
    setAvatarError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAvatarError("Sessão expirada."); setAvatarUploading(false); return; }

    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setAvatarError(uploadError.message || "Erro ao enviar imagem.");
      setAvatarUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const urlWithBust = `${publicUrl}?t=${Date.now()}`;

    const { error: dbError } = await updateAvatarUrlAction(urlWithBust);
    if (dbError) { setAvatarError(dbError); setAvatarUploading(false); return; }

    setAvatarSrc(urlWithBust);
    setAvatarUploading(false);
    router.refresh();
  }

  const currentGroupLabel = GROUPS.find((g) => g.value === groupValue)?.label ?? "Sem grupo";

  const stats = [
    { icon: <Trophy    size={16} className="text-amber-400" />, label: "Vitórias",       value: standing?.wins ?? 0 },
    { icon: <Target    size={16} className="text-lime-500"  />, label: "Aproveitamento", value: `${winRate}%` },
    { icon: <Layers    size={16} className="text-blue-400"  />, label: "Sets ganhos",    value: standing ? `${standing.sets_won}–${standing.sets_lost}` : "0–0" },
    { icon: <TrendingUp size={16} className="text-purple-400" />, label: "Pontos",       value: standing?.points ?? 0 },
  ];

  return (
    <div className="animate-slide-up">
      {/* Hero */}
      <div className="bg-green-900 px-5 pt-6 pb-10 flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar
            name={nameValue}
            src={avatarSrc}
            size="xl"
            className="ring-2 ring-lime-500/30 ring-offset-2 ring-offset-green-900"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-lime-500 border-2 border-green-900 flex items-center justify-center shadow-glow hover:bg-lime-400 transition-colors disabled:opacity-50"
            title="Alterar foto"
          >
            {avatarUploading
              ? <Loader2 size={13} className="text-surface-0 animate-spin" />
              : <Camera  size={13} className="text-surface-0" />
            }
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {avatarError && (
          <p className="text-red-400 text-xs text-center max-w-[200px]">{avatarError}</p>
        )}

        <div className="text-center">
          {editingName ? (
            <div className="flex items-center gap-2 justify-center">
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus
                className="bg-surface-0/50 border border-white/20 text-white text-xl font-display font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-lime-500/50 text-center w-52"
              />
              <button
                onClick={saveName}
                disabled={nameSaving}
                className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center text-surface-0 hover:bg-lime-400 transition-colors"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => { setEditingName(false); setNameValue(player.name); }}
                className="w-8 h-8 rounded-full bg-surface-0/40 flex items-center justify-center text-white/40 hover:bg-surface-0/60 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="group flex items-center gap-2 text-white font-display font-bold text-2xl hover:text-white/80 transition-colors"
            >
              {nameValue}
              <Pencil size={13} className="text-white/30 group-hover:text-lime-500 transition-colors" />
            </button>
          )}
          {nameError && <p className="text-red-400 text-xs mt-1">{nameError}</p>}
          <p className="text-white/35 text-sm font-semibold mt-1">
            {groupValue ? `Grupo ${groupValue}` : "Sem grupo"}
            {standing ? ` · ${standing.position}º no ranking` : ""}
          </p>
        </div>
      </div>

      <div className="px-4 -mt-5 pb-8 space-y-3">
        {/* Stats */}
        <Card>
          <div className="grid grid-cols-2 gap-2.5">
            {stats.map(({ icon, label, value }) => (
              <div key={label} className="bg-surface-3 rounded-xl p-3.5 flex items-center gap-3 border border-white/[0.04]">
                {icon}
                <div>
                  <p className="text-lg font-display font-bold text-white/85">{value}</p>
                  <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wide">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Group selector */}
        <Card>
          <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white/30 mb-3">
            Meu Grupo
          </p>
          <div className="relative">
            <button
              onClick={() => setShowGroupPicker((v) => !v)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm font-semibold",
                groupSaving
                  ? "border-white/[0.06] bg-surface-3 text-white/30 cursor-wait"
                  : "border-white/[0.06] bg-surface-3 text-white/80 hover:border-white/15"
              )}
              disabled={groupSaving}
            >
              <span className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold",
                    groupValue
                      ? "bg-lime-500 text-surface-0"
                      : "bg-surface-4 text-white/30"
                  )}
                >
                  {groupValue ?? "–"}
                </span>
                {groupSaving ? "Salvando..." : currentGroupLabel}
              </span>
              {groupSuccess
                ? <Check size={15} className="text-lime-500" />
                : <ChevronDown size={15} className={cn("text-white/25 transition-transform", showGroupPicker && "rotate-180")} />
              }
            </button>

            {showGroupPicker && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface-3 border border-white/[0.08] rounded-xl shadow-card-lg overflow-hidden z-10">
                {GROUPS.map(({ value, label }) => (
                  <button
                    key={label}
                    onClick={() => saveGroup(value)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/[0.05]",
                      groupValue === value ? "text-lime-400" : "text-white/60"
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-bold",
                        value ? "bg-lime-500/20 text-lime-400 border border-lime-500/30" : "bg-surface-4 text-white/30"
                      )}
                    >
                      {value ?? "–"}
                    </span>
                    {label}
                    {groupValue === value && <Check size={13} className="ml-auto text-lime-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {groupError && <p className="text-red-400 text-xs mt-2">{groupError}</p>}
        </Card>

        {/* Group standing */}
        {standing && (
          <Card>
            <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white/30 mb-3">
              Desempenho — Grupo {groupValue ?? "—"}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Pontos", value: standing.points },
                { label: "Vitórias", value: standing.wins },
                { label: "Derrotas", value: standing.losses },
              ].map(({ label, value }) => (
                <div key={label} className="bg-surface-3 rounded-xl py-3 border border-white/[0.04]">
                  <p className="text-2xl font-display font-bold text-white/85">{value}</p>
                  <p className="text-[9px] text-white/25 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 text-center">
              <div className="bg-surface-3 rounded-xl p-2.5 border border-white/[0.04]">
                <p className="text-sm font-display font-bold text-white/70">{standing.sets_won}–{standing.sets_lost}</p>
                <p className="text-[10px] text-white/25 mt-0.5">Saldo de Sets</p>
              </div>
              <div className="bg-surface-3 rounded-xl p-2.5 border border-white/[0.04]">
                <p className="text-sm font-display font-bold text-white/70">{standing.games_won}–{standing.games_lost}</p>
                <p className="text-[10px] text-white/25 mt-0.5">Saldo de Games</p>
              </div>
            </div>
          </Card>
        )}

        {/* Info */}
        <Card>
          <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white/30 mb-3">
            Informações
          </p>
          <div className="space-y-0.5">
            {[
              { label: "Nome",     value: nameValue },
              { label: "Grupo",    value: currentGroupLabel },
              { label: "Partidas", value: String(matchCount) },
              { label: "Status",   value: "Ativo" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
              >
                <span className="text-xs text-white/30">{label}</span>
                <span className="text-xs font-semibold text-white/70">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Button
          variant="outline"
          fullWidth
          onClick={handleLogout}
          className="border-red-500/20 text-red-400/70 hover:border-red-500/35 hover:bg-red-500/5 hover:text-red-400"
        >
          <LogOut size={15} />
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
