import FileWizard from "@/components/FileWizard";

export default async function FilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const startAtWorkspace = sp.example === "1";
  return <FileWizard startAtWorkspace={startAtWorkspace} />;
}
