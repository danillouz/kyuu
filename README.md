# kyuu

For metadata signaling, WebRTC apps use an intermediary server, but for actual media and data streaming once a session is established, RTCPeerConnection attempts to connect clients directly: peer to peer.

WebRTC needs four types of server-side functionality:

- User discovery and communication
- Signaling
- STUN: NAT & firewall traversal
- TURN: Relay servers in case peer-to-peer communication fails

## User discovery and communication

## Signaling

WebRTC uses RTCPeerConnection to communicate streaming data between peers. This
happens by sending control messages, aka signaling.

Signaling is used to exchange three types of information:

1. Session control messages: open/close communication and report errors
2. Network configuration: IP + port
3. Media capabilities: codecs, resolutions that can be handled by browsers

> Signaling is not part of the RTCPeerConnection API. Its methods an protocols are not specified by WebRTC and can for example be implemented using web sockets.

To avoid redundancy and to maximize compatibility with established technologies,
signaling methods and protocols are not specified by WebRTC standards.
This approach is outlined by JSEP, the JavaScript Session Establishment Protocol

JSEP requires the exchange between peers of offer and answer. Offers and answers
are communicated in Session Description Protocol format (SDP).

Important:

- RTCPeerConnection won't start gathering candidates until setLocalDescription() is called: this is mandated in the JSEP IETF draft.
- Take advantage of Trickle ICE (see above): call addIceCandidate() as soon as candidates arrive.

## STUN & TURN

WebRTC is designed to work peer-to-peer, so users can connect by the most direct route possible. However, WebRTC is built to cope with real-world networking: client applications need to traverse NAT gateways and firewalls, and peer to peer networking needs fallbacks in case direct connection fails. As part of this process, the WebRTC APIs use STUN servers to get the IP address of your computer, and TURN servers to function as relay servers in case peer-to-peer communication fails.

The STUN protocol and its extension TURN are used by the ICE framework to
enable RTCPeerConnection to cope with NAT traversal and other network vagaries.

WebRTC apps can use the ICE framework to overcome the complexities of real-world networking. To enable this to happen, your application must pass ICE server URLs to RTCPeerConnection

ICE is a framework for connecting peers and will initially try to connect directly
via UDP. It will try to use the host address from the device's OS and network card,
but this will fail for devices behind NATs. This is where a STUN server comes in,
which enables a peer behind a NAT to find out its public address and port.

If UDP fails, ICE tries TCP. If direct connection fails—in particular, because
of enterprise NAT traversal and firewalls—ICE uses an intermediary (relay) TURN
server. In other words, ICE will first use STUN with UDP to directly connect
peers and, if that fails, will fall back to a TURN relay server.

---

ICE first tries to make a connection using the host address obtained from a device's operating system and network card; if that fails (which it will for devices behind NATs) ICE obtains an external address using a STUN server, and if that fails, traffic is routed via a TURN relay server.
-> A STUN server is used to get an external network address.
-> TURN servers are used to relay traffic if direct (peer to peer) connection fails.

## STUN

NATs provide a device with an IP address for use within a private local network, but this address can't be used externally. Without a public address, there's no way for WebRTC peers to communicate. To get around this problem WebRTC uses STUN.

STUN servers live on the public internet and have one simple task: check the IP:port address of an incoming request (from an application running behind a NAT) and send that address back as a response. In other words, the application uses a STUN server to discover its IP:port from a public perspective. This process enables a WebRTC peer to get a publicly accessible address for itself, and then pass that on to another peer via a signaling mechanism, in order to set up a direct link.

## TURN

TURN servers act as fallback. RTCPeerConnection tries to set up direct communication between peers over UDP. If that fails, RTCPeerConnection resorts to TCP. If that fails, TURN servers can be used as a fallback, relaying data between endpoints.
TURN is used to relay audio/video/data streaming between peers, not signaling data!
TURN servers have public addresses, so they can be contacted by peers even if the peers are behind firewalls or proxies.

## RTCDataChannel

- It works with the RTCPeerConnection API, which enables peer to peer connectivity. This can result in lower latency: no intermediary server, fewer 'hops'.
- RTCDataChannel uses Stream Control Transmission Protocol (SCTP), allowing configurable delivery semantics: out-of-order delivery and retransmit configuration.

## Resources

- https://www.html5rocks.com/en/tutorials/webrtc/basics/
- https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/
- https://www.html5rocks.com/en/tutorials/webrtc/datachannels/
- https://www.twilio.com/docs/stun-turn
