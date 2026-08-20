import { TutorialEditor } from "@/components/tutorials/tutorial-editor"
export default async function EditAdminTutorialPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TutorialEditor basePath="/admin" tutorialId={id} /> }
