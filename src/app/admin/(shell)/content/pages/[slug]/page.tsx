"use client";
import { useParams } from "next/navigation";
import { Editor } from "@/components/admin/pagebuilder/Editor";

export default function PageBuilder() {
  const { slug } = useParams<{ slug: string }>();
  return <Editor slug={slug} />;
}
