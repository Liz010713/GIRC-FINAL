interface FeedbackBannersProps {
  mensajeError: string | null;
  mensajeExito: string | null;
  onCerrarError: () => void;
  onCerrarExito: () => void;
}

export function FeedbackBanners({
  mensajeError,
  mensajeExito,
  onCerrarError,
  onCerrarExito,
}: FeedbackBannersProps) {
  return (
    <>
      {mensajeError && (
        <div className="feedback-banner error" role="alert">
          <span>{mensajeError}</span>
          <button
            type="button"
            className="feedback-close"
            onClick={onCerrarError}
            aria-label="Cerrar error"
          >
            ×
          </button>
        </div>
      )}

      {mensajeExito && (
        <div className="feedback-banner success" aria-live="polite">
          <span>{mensajeExito}</span>
          <button
            type="button"
            className="feedback-close"
            onClick={onCerrarExito}
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
