document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("avatar");

    try {
        const res = await fetch("/api/did/createStream");
        const { streamId, offer, ice_servers } = await res.json();

        const pc = new RTCPeerConnection({ iceServers: ice_servers });

        // Attach avatar stream to video element
        pc.ontrack = (event) => {
            video.srcObject = event.streams[0];
        };

        // Set remote SDP from D-ID
        await pc.setRemoteDescription(offer);

        // Create local answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send SDP back to D-ID
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
