import { redirect } from "next/navigation"

export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<{ visitorId: string }>
}) {
  const { visitorId } = await params
  redirect(`/journeys?visitor=${encodeURIComponent(visitorId)}`)
}
