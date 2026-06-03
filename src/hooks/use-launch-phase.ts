// Fase 1 (pré-lançamento) foi encerrada. O site agora opera apenas como
// site oficial do empreendimento. Mantemos o hook por compatibilidade com
// componentes que ainda importam, mas ele sempre retorna "live".

export type LaunchPhase = "live";

export function useLaunchPhase(): LaunchPhase {
  return "live";
}
