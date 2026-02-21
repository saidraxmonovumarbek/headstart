"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Plus, X } from "lucide-react";

type Tab = "exams" | "database" | "results";
type Type = "listening" | "reading" | "writing" | null;
type Section = "full" | "p1" | "p2" | "p3" | null;

export default function MockExamPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [tab, setTab] = useState<Tab>("exams");

  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Type>(null);
  const [section, setSection] = useState<Section>(null);

  const [duration, setDuration] = useState(20);
  const [difficulty, setDifficulty] = useState("medium");
  const [title, setTitle] = useState("");
  const [metaDone, setMetaDone] = useState(false);

  type Paragraph = {
  id: string;
  text: string;
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg";
};

const [paragraphs, setParagraphs] = useState<Paragraph[]>([
  { id: crypto.randomUUID(), text: "", align: "left", size: "md" },
]);

  const [editorTab, setEditorTab] = useState<"passage" | "questions" | "preview">("passage");

  const isAdmin = role === "admin";

  function updateParagraph(id: string, value: string) {
  setParagraphs((prev) =>
    prev.map((p) => (p.id === id ? { ...p, text: value } : p))
  );
}

function addParagraph() {
  setParagraphs((p) => [
    ...p,
    { id: crypto.randomUUID(), text: "", align: "left", size: "md" },
  ]);
}

function deleteParagraph(id: string) {
  setParagraphs((p) => p.filter((x) => x.id !== id));
}

function toggleBold(id: string) {
  setParagraphs((prev) =>
    prev.map((p) => (p.id === id ? { ...p, bold: !p.bold } : p))
  );
}

function toggleItalic(id: string) {
  setParagraphs((prev) =>
    prev.map((p) => (p.id === id ? { ...p, italic: !p.italic } : p))
  );
}

function setAlign(id: string, align: "left" | "center" | "right") {
  setParagraphs((prev) =>
    prev.map((p) => (p.id === id ? { ...p, align } : p))
  );
}

function setSize(id: string, size: "sm" | "md" | "lg") {
  setParagraphs((prev) =>
    prev.map((p) => (p.id === id ? { ...p, size } : p))
  );
}

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Mock Exams</h1>

        {isAdmin && (
          <button
            onClick={() => {
              setOpen(true);
              setType(null);
              setSection(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
          >
            <Plus size={16} />
            Create Mock Exam
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="bg-white border rounded-xl p-2 flex gap-2 w-fit">
        <TabButton
          active={tab === "exams"}
          onClick={() => setTab("exams")}
          label="Mock Exams"
        />

        {isAdmin && (
          <>
            <TabButton
              active={tab === "database"}
              onClick={() => setTab("database")}
              label="Mock Database"
            />

            <TabButton
              active={tab === "results"}
              onClick={() => setTab("results")}
              label="Results"
            />
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="bg-white border rounded-2xl p-10 min-h-[420px] shadow-sm">
        {tab === "exams" && (
          <Empty title="No active mock exams yet" />
        )}

        {tab === "database" && isAdmin && (
          <Empty title="Mock database empty" />
        )}

        {tab === "results" && isAdmin && (
          <Empty title="No submitted mock results yet" />
        )}
      </div>

      {/* POPUP */}
      {open && (
        <Modal onClose={() => setOpen(false)}>
          {/* TYPE SELECTOR */}
          {!type && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select test type</h2>

              <div className="flex gap-3">
                {["listening", "reading", "writing"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t as Type)}
                    className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* READING SECTION SELECTOR */}
          {type === "reading" && !section && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Select reading section
              </h2>

              <div className="flex gap-3">
                {["full", "p1", "p2", "p3"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSection(s as Section)}
                    className="border px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PLACEHOLDER NEXT STEP */}
          {/* METADATA FORM */}
{type === "reading" && section && !metaDone && (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold">Mock exam info</h2>

    <input
      placeholder="Mock title"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className="border p-2 rounded w-full"
    />

    <div className="flex gap-3">
      <input
        type="number"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        className="border p-2 rounded w-24"
      />

      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="easy">easy</option>
        <option value="medium">medium</option>
        <option value="hard">hard</option>
      </select>
    </div>

    <button
      disabled={!title}
      onClick={() => setMetaDone(true)}
      className="bg-green-600 text-white px-4 py-2 rounded"
    >
      Next
    </button>
  </div>
)}

{/* PLACEHOLDER FOR NEXT STEP */}
{/* EDITOR */}
{metaDone && (
  <div className="space-y-4">

    {/* TABS */}
    <div className="flex gap-2 border-b pb-2">
      <button
        onClick={() => setEditorTab("passage")}
        className={`px-3 py-1 rounded ${
          editorTab === "passage" && "bg-green-100"
        }`}
      >
        Passage
      </button>

      <button
        onClick={() => setEditorTab("questions")}
        className={`px-3 py-1 rounded ${
          editorTab === "questions" && "bg-green-100"
        }`}
      >
        Questions
      </button>

      <button
        onClick={() => setEditorTab("preview")}
        className={`px-3 py-1 rounded ${
          editorTab === "preview" && "bg-green-100"
        }`}
      >
        Preview
      </button>
    </div>

    {/* PASSAGE TAB */}
    {editorTab === "passage" && (
      <div className="space-y-4">
        {paragraphs.map((p) => (
  <div key={p.id} className="space-y-2 border rounded-lg p-3">

    {/* TOOLBAR */}
    <div className="flex gap-2 text-xs">
      <button onClick={() => toggleBold(p.id)} className="border px-2 py-1 rounded">B</button>
      <button onClick={() => toggleItalic(p.id)} className="border px-2 py-1 rounded">I</button>

      <button onClick={() => setAlign(p.id,"left")} className="border px-2 py-1 rounded">L</button>
      <button onClick={() => setAlign(p.id,"center")} className="border px-2 py-1 rounded">C</button>
      <button onClick={() => setAlign(p.id,"right")} className="border px-2 py-1 rounded">R</button>

      <button onClick={() => setSize(p.id,"sm")} className="border px-2 py-1 rounded">S</button>
      <button onClick={() => setSize(p.id,"md")} className="border px-2 py-1 rounded">M</button>
      <button onClick={() => setSize(p.id,"lg")} className="border px-2 py-1 rounded">L</button>
    </div>

    {/* TEXTAREA */}
    <textarea
      rows={4}
      value={p.text}
      onChange={(e) => updateParagraph(p.id, e.target.value)}
      className="w-full border p-2 rounded"
      placeholder="Paragraph"
    />

    {paragraphs.length > 1 && (
      <button
        onClick={() => deleteParagraph(p.id)}
        className="text-xs text-red-500"
      >
        Delete paragraph
      </button>
    )}
  </div>
))}

        <button
          onClick={addParagraph}
          className="border px-4 py-2 rounded"
        >
          Add paragraph
        </button>
      </div>
    )}

    {/* QUESTIONS TAB (placeholder) */}
    {editorTab === "questions" && (
      <div className="text-gray-500 text-sm">
        Question editor coming next step
      </div>
    )}

    {/* PREVIEW TAB */}
    {editorTab === "preview" && (
      <div className="border rounded-xl p-6 space-y-4 bg-gray-50">
        <h2 className="font-bold text-lg">Exam preview</h2>

        <div className="space-y-3">
          {paragraphs.map((p) => (
  <p
    key={p.id}
    className={`
      ${p.bold && "font-bold"}
      ${p.italic && "italic"}
      ${p.align === "center" && "text-center"}
      ${p.align === "right" && "text-right"}
      ${p.size === "sm" && "text-sm"}
      ${p.size === "md" && "text-base"}
      ${p.size === "lg" && "text-lg"}
      leading-relaxed
    `}
  >
    {p.text}
  </p>
))}
        </div>
      </div>
    )}

    {/* FOOTER */}
    <button className="bg-green-600 text-white px-4 py-2 rounded">
      Finish (backend later)
    </button>

  </div>
)}
        </Modal>
      )}
    </div>
  );
}

/* ---------- MODAL ---------- */

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[520px] relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
        >
          <X size={18} />
        </button>

        {children}
      </div>
    </div>
  );
}

/* ---------- TAB BUTTON ---------- */

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-lg transition ${
        active
          ? "bg-green-600 text-white"
          : "hover:bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

/* ---------- EMPTY STATE ---------- */

function Empty({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
      {title}
    </div>
  );
}