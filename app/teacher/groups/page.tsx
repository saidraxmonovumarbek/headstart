"use client";

import { useEffect, useState } from "react";

export default function TeacherGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const [inviteId, setInviteId] = useState("");
  const [homeworks, setHomeworks] = useState<any[]>([]);

  const [homeworkContent, setHomeworkContent] = useState("");
  const [homeworkDate, setHomeworkDate] = useState("");

  const [showInvite, setShowInvite] = useState(false);
  const [showHomeworkCreate, setShowHomeworkCreate] = useState(false);
  const [showHomeworkList, setShowHomeworkList] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data);
  }

  async function inviteStudent() {
    await fetch(`/api/groups/${selectedGroup.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: inviteId }),
    });

    setInviteId("");
    setShowInvite(false);
  }

  async function createHomework() {
    await fetch("/api/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: homeworkContent,
        date: homeworkDate,
        groupId: selectedGroup.id,
      }),
    });

    setHomeworkContent("");
    setHomeworkDate("");
    setShowHomeworkCreate(false);
  }

  async function fetchHomeworks(groupId: string) {
    const res = await fetch(`/api/homework?groupId=${groupId}`);
    const data = await res.json();
    setHomeworks(data);
    setShowHomeworkList(true);
  }

  async function deleteHomework(id: string) {
    await fetch(`/api/homework/${id}`, {
      method: "DELETE",
    });
    fetchHomeworks(selectedGroup.id);
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-bold">My Groups</h1>

      <div className="space-y-6">
        {groups.length === 0 && (
          <div className="text-gray-400">No groups assigned yet.</div>
        )}

        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-white p-6 rounded-xl border shadow-sm space-y-3"
          >
            <h3 className="text-xl font-semibold">{group.name}</h3>

            <p className="text-gray-600">
              Monthly Price: {group.monthlyPrice ?? "—"}
            </p>

            <p className="text-gray-600">
              Type: {group.dayType ?? "—"}
            </p>

            <p className="text-gray-600">
              Time: {group.startTime ?? "—"} - {group.endTime ?? "—"}
            </p>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => {
                  setSelectedGroup(group);
                  setShowInvite(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Invite Student
              </button>

              <button
                onClick={() => {
                  setSelectedGroup(group);
                  setShowHomeworkCreate(true);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Give Homework
              </button>

              <button
                onClick={() => {
                  setSelectedGroup(group);
                  fetchHomeworks(group.id);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded"
              >
                See Homework
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* INVITE MODAL */}
      {showInvite && (
        <Modal onClose={() => setShowInvite(false)}>
          <h2 className="text-xl font-bold mb-4">Invite Student</h2>

          <input
            placeholder="Paste Student ID"
            className="border p-2 w-full mb-4"
            value={inviteId}
            onChange={(e) => setInviteId(e.target.value)}
          />

          <button
            onClick={inviteStudent}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Invite
          </button>
        </Modal>
      )}

      {/* CREATE HOMEWORK MODAL */}
      {showHomeworkCreate && (
        <Modal onClose={() => setShowHomeworkCreate(false)}>
          <h2 className="text-xl font-bold mb-4">Create Homework</h2>

          <input
            type="date"
            className="border p-2 w-full mb-4"
            value={homeworkDate}
            onChange={(e) => setHomeworkDate(e.target.value)}
          />

          <textarea
            placeholder="Homework content"
            className="border p-2 w-full mb-4"
            value={homeworkContent}
            onChange={(e) => setHomeworkContent(e.target.value)}
          />

          <button
            onClick={createHomework}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Send Homework
          </button>
        </Modal>
      )}

      {/* HOMEWORK LIST MODAL */}
      {showHomeworkList && (
        <Modal onClose={() => setShowHomeworkList(false)}>
          <h2 className="text-xl font-bold mb-4">Homework List</h2>

          {homeworks.length === 0 && (
            <div>No homework yet.</div>
          )}

          {homeworks.map((hw) => (
            <div
              key={hw.id}
              className="border p-3 rounded mb-3"
            >
              <p className="font-semibold">
                {new Date(hw.date).toDateString()}
              </p>
              <p>{hw.content}</p>

              <button
                onClick={() => deleteHomework(hw.id)}
                className="text-red-600 mt-2"
              >
                Delete
              </button>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl w-[400px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}