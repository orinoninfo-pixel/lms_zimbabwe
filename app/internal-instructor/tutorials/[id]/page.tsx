import { TutorialEditor } from "@/components/tutorials/tutorial-editor"
export default async function EditContentTutorialPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TutorialEditor basePath="/internal-instructor" tutorialId={id} /> }
