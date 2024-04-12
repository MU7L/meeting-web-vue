import type { InjectionKey, Ref } from 'vue';

import type Peer from '@/utils/peer';

interface PeerMapCtrl {
    enabled: Ref<boolean>;
    peerMap: Ref<Map<string, Peer>>;
    changeStream: (newStream?: MediaStream, oldStream?: MediaStream) => void;
}

const PEER_MAP_CTRL = Symbol() as InjectionKey<PeerMapCtrl>;

export default PEER_MAP_CTRL;
