import { CatalogPage } from "@/features/catalog/components/catalog-page";

type CatalogoPageProps = {
  searchParams?: Promise<{ message?: string }>;
};

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const params = searchParams ? await searchParams : undefined;

  return <CatalogPage message={params?.message} />;
}
