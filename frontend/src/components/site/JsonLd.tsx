/**
 * Ubacuje structured data (schema.org) kao <script type="application/ld+json">.
 * Server komponenta — renderuje se u HTML-u koji Google čita.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Podaci dolaze sa našeg backenda/demo-a; JSON.stringify escape-uje sadržaj.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
