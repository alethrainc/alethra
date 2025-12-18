document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("avatar");

    try {
        // Fetch your agent stream info from your backend API
        const res = await fetch("/api/did/createStream"); 
        const data = await res.json();

        const { streamId, offer, ice_servers } = data;

        // Use ice_servers correctly
        const pc = new RTCPeerConnection({ iceServers: ice_servers });

        pc.ontrack = (event) => { video.srcObject = event.streams[0]; };

        await pc.setRemoteDescription(offer);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await fetch("/api/did/sdp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ streamId, sdp: pc.localDescription })
        });

        console.log("✅ Agent stream started automatically");
    } catch (err) {
        console.error("❌ Failed to start agent:", err);
    }
});
