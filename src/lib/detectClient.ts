const BASE = import.meta.env.VITE_DETECTOR_URL || "http://localhost:8000";

export async function enqueueImageCheck(imageBlob: Blob) {
  const fd = new FormData();
  fd.append("file", imageBlob, "frame.jpg");
  const res = await fetch(`${BASE}/enqueue/image`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("enqueue failed");
  return res.json(); // should contain { job_id }
}

export async function getJobResult(jobId: string) {
  const res = await fetch(`${BASE}/result/${jobId}`);
  if (!res.ok) throw new Error("result fetch failed");
  return res.json();
}

export async function sendImageDirect(imageBlob: Blob) {
  const fd = new FormData();
  fd.append("file", imageBlob, "frame.jpg");
  const res = await fetch(`${BASE}/camera-check`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("camera-check failed");
  return res.json();
}

export default { enqueueImageCheck, getJobResult, sendImageDirect };
