const startBtn = document.getElementById("start");
const video = document.getElementById("avatar");

startBtn.onclick = async () => {
  const streamRes = await fetch("/api/did/createStream");
  const { streamId, offer, ice_servers } = await streamRes.json();

  const pc = new RTCPeerConnection({ iceServers: ice_servers });

  pc.ontrack = (e) => {
    video.srcObject = e.streams[0];
  };

  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  await fetch("/api/did/sdp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ streamId, sdp: pc.localDescription })
  });
};
