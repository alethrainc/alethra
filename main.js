document.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("avatar");

    try {
        // Example: fetch from your backend API that creates the D-ID stream
        const res = await fetch("/api/did/createStream"); // this must exist on your server
        const data = await res.json();

        const { streamId, offer, ice_servers } = data;

        // Use ice_servers, not iceServers
        const pc = new RTCPeerConnection({ iceServers: ice_servers });

        pc.ontrack = (event) => {
            video.srcObject = event.streams[0];
        };

        await pc.setRemoteDescription(offer);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Send answer back to server
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
