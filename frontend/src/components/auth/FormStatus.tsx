type FormStatusProps = {
  error?: string;
  slow: boolean;
};

/**
 * Messages above the submit button (our design — Figma has no states for these).
 * The live regions are always rendered so screen readers announce changes reliably.
 */
export function FormStatus({ error, slow }: FormStatusProps) {
  return (
    <>
      <p role="alert" className="text-body-s text-danger empty:hidden">
        {error}
      </p>
      <p role="status" className="text-body-s text-neutral-600 empty:hidden">
        {slow && !error ? "Waking up the server — this can take up to a minute on the first request." : ""}
      </p>
    </>
  );
}
