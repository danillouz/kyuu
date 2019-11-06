# Learning WebRTC

[WebRTC](https://webrtc.org/) applications attempt to establish a session between
clients (peers) in order to directly connect them and stream data (peer-to-peer or p2p).
The only exception is metadata signaling, for which an intermediary server is required.

WebRTC needs four types of server-side functionality:

- User discovery and communication.
- Signaling.
- ICE:
  - STUN: NAT & firewall traversal.
  - TURN: Relay servers in case peer-to-peer communication fails.

## User discovery and communication

TODO

## Signaling

WebRTC uses `RTCPeerConnection` to stream data between peers. This happens by
sending control messages (signaling).

Signaling is used to exchange three types of information:

1. Session control messages: open/close communication and report errors.
2. Network configuration: IP + port.
3. Media capabilities: codecs, resolutions that can be handled by browsers.

> Signaling is not part of the `RTCPeerConnection` API. Its methods and protocols are not specified by WebRTC and can for example be implemented using web sockets.

To avoid redundancy and to maximize compatibility with established technologies,
signaling methods and protocols are not specified by WebRTC standards.
This approach is outlined by the [JavaScript Session Establishment Protocol (JSEP)](https://rtcweb-wg.github.io/jsep/).

JSEP requires the exchange of an _offer_ and _answer_ between peers. Offers and answers
are communicated in [Session Description Protocol format (SDP)](https://developer.mozilla.org/en-US/docs/Glossary/SDP).

Important:

- `RTCPeerConnection` won't start gathering candidates until `setLocalDescription` is called: this is mandated in the JSEP IETF draft.
- Take advantage of Trickle ICE; call `addIceCandidate` as soon as candidates arrive.

## ICE

WebRTC is designed to work p2p, so users can connect by the most direct route possible.
However, WebRTC is built to cope with real-world networking. Client applications
need to traverse NAT gateways and firewalls, and p2p networking needs fallbacks in case
a direct connection fails. As part of this process, the WebRTC APIs use STUN servers to
get the IP address of your computer, and TURN servers to function as relay servers in case
p2p communication fails.

This behavior is facilitated by the [ICE](https://tools.ietf.org/html/rfc5245) framework
and the application must pass ICE server URLs to `RTCPeerConnection`.

ICE is a framework for connecting peers and will initially try to connect directly
via UDP. It will try to use the host address from the device's OS and network card,
but this will fail for devices behind NATs. This is where a STUN server comes in,
which enables a peer behind a NAT to find out its public address and port.

If UDP fails, ICE tries TCP. If direct connection fails (e.g. firewalls) ICE uses
an intermediary TURN (relay) server.

### STUN

NATs provide a device with an IP address for use within a private local network, but
this address can't be used externally. Without a public address, there's no way for
WebRTC peers to communicate. To get around this problem WebRTC uses STUN.

STUN servers live on the public internet and have one simple task: check the `IP:PORT`
address of an incoming request (from an application running behind a NAT) and send
that address back as a response. In other words, the application uses a STUN server
to discover its `IP:PORT` from a public perspective. This process enables a WebRTC
peer to get a publicly accessible address for itself, and then pass that on to
another peer via a signaling mechanism, in order to set up a direct link.

### TURN

TURN servers act as fallback. `RTCPeerConnection` tries to set up direct communication between peers over UDP. If that fails, `RTCPeerConnection` resorts to TCP. If that
fails, TURN servers can be used as a fallback, relaying data between endpoints.
TURN is used to relay streaming data between peers (not signaling data!).

TURN servers have public addresses, so they can be contacted by peers even if the
peers are behind firewalls or proxies.

## RTCDataChannel

`RTCDataChannel` works with the `RTCPeerConnection` API, which enables p2p connectivity.
This can result in lower latency; no intermediary server, fewer "hops".

`RTCDataChannel` uses Stream Control Transmission Protocol (SCTP), allowing configurable
delivery semantics; out-of-order delivery and retransmit configuration.

## Resources

- https://www.html5rocks.com/en/tutorials/webrtc/basics/
- https://www.html5rocks.com/en/tutorials/webrtc/infrastructure/
- https://www.html5rocks.com/en/tutorials/webrtc/datachannels/
- https://www.twilio.com/docs/stun-turn
