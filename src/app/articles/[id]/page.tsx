import ArticleDetailClient from "./ArticleDetailClient";

export const dynamicParams = false;

export async function generateStaticParams() {
  return [];
}

export default function ArticleDetailPage(props: { params: Promise<{ id: string }> }) {
  return <ArticleDetailClient params={props.params} />;
}
