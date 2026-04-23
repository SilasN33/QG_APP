"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  LogOut, Trophy, Target, Layers, TrendingUp,
  Pencil, Check, X, ChevronDown,
} from "lucide-react";
import { updatePlayerGroupAction, updatePlayerNameAction } from "@/lib/actions/updatePlayer";
import { cn } from "@/utils/cn";
import type { Player, Standing, GroupLetter } from "@/types";

interface Props {
  player: Player;
  standing: Standing | null;
  matchCount: number;
}

const GROUPS: { value: GroupLetter | null; label: string }[] = [
  { value: null,  label: "Sem grupo" },
  { value: "A",   label: "Grupo A" },
  { value: "B",   label: "Grupo B" },
  { value: "C",   label: "Grupo C" },
  { value: "D",   label: "Grupo D" },
];

export function PerfilClient({ player, standing, matchCount }: Props) {
  const router = useRouter();

  // Name edit state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue]     = useState(player.name);
  const [nameSaving, setNameSaving]   = useState(false);
  const [nameError, setNameError]     = useState<string | null>(null);

  // Group edit state
  const [showGroupPicker, setShowGroupPicker] = useState(false);
  const [groupValue, setGroupValue]           = useState<GroupLetter | null>(player.group_letter);
  const [groupSaving, setGroupSaving]         = useState(false);
  const [groupError, setGroupError]           = useState<string | null>(null);
  const [groupSuccess, setGroupSuccess]       = useState(false);

  const winRate =
    matchCount > 0 && standing
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

  const stats = [
    { icon: <Trophy size={18} className="text-amber-400" />,   label: "Vitórias",        value: standing?.wins ?? 0 },
    { icon: <Target size={18} className="text-clay-400" />,    label: "Aproveitamento",  value: `${winRate}%` },
    { icon: <Layers size={18} className="text-blue-400" />,    label: "Sets ganhos",     value: standing ? `${standing.sets_won}-${standing.sets_lost}` : "0-0" },
    { icon: <TrendingUp size={18} className="text-green-500" />, label: "Pontos",         value: standing?.points ?? 0 },
  ];

  const currentGroupLabel = GROUPS.find((g) => g.value === groupValue)?.label ?? "Sem grupo";

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="bg-green-900 px-4 pt-6 pb-10 flex flex-col items-center gap-3">
        <Avatar name={nameValue} src={player.avatar_url} size="xl" />
        <div className="text-center">
          {editingName ? (
            <div className="flex items-center gap-2 justify-center">
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus
                className="bg-green-800/80 border border-green-600 text-white text-xl font-black rounded-xl px-3 py-1.5 focus:outline-none focus:border-clay-400 text-center w-52"
              />
              <button
                onClick={saveName}
                disabled={nameSaving}
                className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-green-100 hover:bg-green-600 transition-colors"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => { setEditingName(false); setNameValue(player.name); }}
                className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center text-green-400 hover:bg-green-700 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="group flex items-center gap-2 text-white font-black text-2xl hover:text-green-200 transition-colors"
            >
              {nameValue}
              <Pencil size={14} className="text-green-500 group-hover:text-green-300 transition-colors" />
            </button>
          )}
          {nameError && <p className="text-clay-300 text-xs mt-1">{nameError}</p>}
          <p className="text-clay-400 text-sm font-bold mt-0.5">
            {groupValue ? `Grupo ${groupValue}` : "Sem grupo"}
            {standing ? ` · ${standing.position}º no ranking` : ""}
          </p>
        </div>
      </div>

      <div className="px-4 -mt-6 pb-8 space-y-3">
        {/* Stats */}
        <Card className="border border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                {icon}
                <div>
                  <p className="text-lg font-black text-gray-800">{value}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Group selector */}
        <Card className="border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Meu Grupo
          </p>
          <div className="relative">
            <button
              onClick={() => setShowGroupPicker((v) => !v)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-sm font-semibold",
                groupSaving
                  ? "border-gray-100 bg-gray-50 text-gray-400 cursor-wait"
                  : "border-gray-100 bg-gray-50 text-gray-800 hover:border-green-700/40"
              )}
              disabled={groupSaving}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black",
                    groupValue ? "bg-green-900 text-white" : "bg-gray-200 text-gray-400"
                  )}
                >
                  {groupValue ?? "–"}
                </span>
                {groupSaving ? "Salvando..." : currentGroupLabel}
              </span>
              {groupSuccess
                ? <Check size={16} className="text-green-600" />
                : <ChevronDown size={16} className={cn("text-gray-400 transition-transform", showGroupPicker && "rotate-180")} />
              }
            </button>

            {showGroupPicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-10">
                {GROUPS.map(({ value, label }) => (
                  <button
                    key={label}
                    onClick={() => saveGroup(value)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors hover:bg-gray-50",
                      groupValue === value ? "text-green-800 bg-green-50" : "text-gray-700"
                    )}
                  >
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black",
                        value ? "bg-green-900 text-white" : "bg-gray-200 text-gray-400"
                      )}
                    >
                      {value ?? "–"}
                    </span>
                    {label}
                    {groupValue === value && <Check size={14} className="ml-auto text-green-700" />}
                  </button>
                ))}
              </div>
            )}
          </div>
          {groupError && <p className="text-clay-600 text-xs mt-2">{groupError}</p>}
        </Card>

        {/* Group standings */}
        {standing && (
          <Card className="border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Desempenho no Grupo {groupValue ?? "—"}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Pontos", value: standing.points },
                { label: "V",      value: standing.wins },
                { label: "D",      value: standing.losses },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-2xl font-black text-gray-800">{value}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-sm font-bold text-gray-700">{standing.sets_won}-{standing.sets_lost}</p>
                <p className="text-[10px] text-gray-400">Saldo de Sets</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-sm font-bold text-gray-700">{standing.games_won}-{standing.games_lost}</p>
                <p className="text-[10px] text-gray-400">Saldo de Games</p>
              </div>
            </div>
          </Card>
        )}

        {/* Info */}
        <Card className="border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Informações</p>
          <div className="space-y-2">
            {[
              { label: "Nome",      value: nameValue },
              { label: "Grupo",     value: currentGroupLabel },
              { label: "Partidas",  value: String(matchCount) },
              { label: "Status",    value: "Ativo" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs font-semibold text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Button
          variant="outline"
          fullWidth
          onClick={handleLogout}
          className="border-red-200 text-red-500 hover:bg-red-50"
        >
          <LogOut size={16} />
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
