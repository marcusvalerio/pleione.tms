export type Tone = "plan" | "neutral" | "transit" | "warning" | "danger" | "success" | "info";
type StatusMap = Record<string, { label: string; tone: Tone }>;

export const STATUS = {
  load: {
    planned: { label: "Planejada", tone: "plan" },
    loading: { label: "Em carregamento", tone: "neutral" },
    in_transit: { label: "Em trânsito", tone: "transit" },
    at_risk: { label: "Janela em risco", tone: "warning" },
    incident: { label: "Ocorrência", tone: "danger" },
    delivered: { label: "Entregue", tone: "success" },
  } satisfies StatusMap,
  stop: {
    pending: { label: "Pendente", tone: "neutral" },
    on_time: { label: "No prazo", tone: "success" },
    at_risk: { label: "Em risco", tone: "warning" },
    delivered: { label: "Entregue", tone: "success" },
    incident: { label: "Ocorrência", tone: "danger" },
  } satisfies StatusMap,
  shipment: {
    ready: { label: "Pronto para carregar", tone: "info" },
    assigned: { label: "Em carga", tone: "transit" },
    waiting: { label: "Aguardando conferência", tone: "neutral" },
  } satisfies StatusMap,
  vehicle: {
    available: { label: "Disponível", tone: "success" },
    on_trip: { label: "Em viagem", tone: "transit" },
    maintenance: { label: "Manutenção", tone: "warning" },
  } satisfies StatusMap,
  driver: {
    available: { label: "Disponível", tone: "success" },
    on_trip: { label: "Em viagem", tone: "transit" },
    rest: { label: "Descanso obrigatório", tone: "neutral" },
    cnh_expiring: { label: "CNH vencendo", tone: "warning" },
  } satisfies StatusMap,
  incident: {
    open: { label: "Aberta", tone: "danger" },
    handling: { label: "Em tratativa", tone: "warning" },
    closed: { label: "Resolvida", tone: "success" },
  } satisfies StatusMap,
};
