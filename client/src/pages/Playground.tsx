import React, { useState, useEffect, useRef } from 'react';
import { MindWebsiteScene } from '../mindwebsite/MindWebsiteScene';
import { VisualCodeEditor } from '../components/VisualCodeEditor';
import { CodeParser, type ParsedAction } from '../utils/codeParser';
import { WebSocketClient, type WebSocketEventPayloads } from '../utils/websocketClient';
type Vec3 = [
    number,
    number,
    number
];
interface MindData {
    id: number;
    name: string;
    color: string;
    position: Vec3;
    rotation?: Vec3;
    scale: number;
    detail?: string;
    mental_sphere_ids?: number[];
    variable?: string;
    _preview?: boolean;
}
interface MentalData {
    id: number;
    name: string;
    color: string;
    scale: number;
    position: Vec3;
    variable?: string;
    _preview?: boolean;
}
type ConnectionStatus = 'disconnected' | 'connected' | 'error';
type VariableRef = {
    type: 'mind' | 'mental';
    id: number;
};
type WSMessage = WebSocketEventPayloads['message'] & {
    type?: string;
    status?: string;
    action?: string;
    request_id?: string;
    data?: any;
    error?: string | any;
};
export function Playground(): React.ReactElement {
    const [_code, setCode] = useState<string>('');
    const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
    const [minds, setMinds] = useState<MindData[]>([]);
    const [mentals, setMentals] = useState<MentalData[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
    const wsClientRef = useRef<WebSocketClient | null>(null);
    const currentRunIdRef = useRef<string>('');
    const liveUpdateTimerRef = useRef<number | null>(null);
    const variableToIdRef = useRef<Map<string, VariableRef>>(new Map());
    const pendingMindsRef = useRef<Map<string, string>>(new Map());
    const pendingMentalsRef = useRef<Map<string, string>>(new Map());
    const mindsRef = useRef<MindData[]>([]);
    const mentalsRef = useRef<MentalData[]>([]);
    useEffect(() => {
        const client = new WebSocketClient(import.meta.env.VITE_WS_URL || 'ws://localhost:8004', `user_${Math.floor(Math.random() * 10000)}`);
        client.on('connected', () => {
            setConnectionStatus('connected');
            console.log('WebSocket connected');
        });
        client.on('disconnected', () => {
            setConnectionStatus('disconnected');
            console.log('WebSocket disconnected');
        });
        client.on('message', (data) => {
            console.log('WebSocket message received:', data);
            handleWebSocketMessage(data as WSMessage);
        });
        client.on('error', (error) => {
            console.error('WebSocket error:', error);
            setConnectionStatus('error');
        });
        client.connect().catch((err) => {
            console.error(err);
        });
        wsClientRef.current = client;
        setWsClient(client);
        return () => {
            client.disconnect();
        };
    }, []);
    const handleWebSocketMessage = (data: WSMessage) => {
        if (data.request_id && currentRunIdRef.current) {
            if (!data.request_id.startsWith(`${currentRunIdRef.current}:`)) {
                return;
            }
        }
        if (data.type === 'response' && data.status === 'error') {
            console.error('WebSocket error response:', data);
            const errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
            alert(`Error: ${errorMsg || 'Unknown error'}`);
            return;
        }
        if (data.type === 'response' && data.status === 'success') {
            if (data.action === 'upsert_mind' && data.data?.mind) {
                const mind = data.data.mind as MindData;
                const variable = data.request_id ? pendingMindsRef.current.get(data.request_id) : undefined;
                if (variable && data.request_id) {
                    variableToIdRef.current.set(variable, { type: 'mind', id: mind.id });
                    pendingMindsRef.current.delete(data.request_id);
                }
                setMinds((prev) => {
                    console.log('[Playground] upsert_mind response handler - current minds:', prev.map(m => ({ id: m.id, name: m.name, preview: m._preview })));
                    const filtered = prev.filter((m) => !(m._preview && m.id === mind.id));
                    const existing = filtered.find((m) => !m._preview && m.id === mind.id);
                    console.log('[Playground] upsert_mind response - existing mind found:', existing ? { id: existing.id, name: existing.name } : 'none');
                    const preservedMentalSphereIds = existing && existing.mental_sphere_ids && existing.mental_sphere_ids.length > 0
                        ? existing.mental_sphere_ids
                        : (mind.mental_sphere_ids && mind.mental_sphere_ids.length > 0 ? mind.mental_sphere_ids : []);
                    const existingVariable = existing?.variable || variable;
                    const updatedMind: MindData = {
                        ...mind,
                        variable: existingVariable,
                        mental_sphere_ids: preservedMentalSphereIds
                    };
                    let next: MindData[];
                    if (existing) {
                        next = filtered.map((m) => (m.id === mind.id && !m._preview ? updatedMind : m));
                    }
                    else {
                        const duplicateCheck = filtered.find((m) => !m._preview && m.id === mind.id);
                        if (duplicateCheck) {
                            console.warn('[Playground] upsert_mind response - duplicate detected, updating instead of adding');
                            next = filtered.map((m) => (m.id === mind.id && !m._preview ? updatedMind : m));
                        }
                        else {
                            next = [...filtered, updatedMind];
                        }
                    }
                    const seenIds = new Set<number>();
                    const deduplicated = next.filter((m) => {
                        if (seenIds.has(m.id)) {
                            console.warn('[Playground] upsert_mind response - removing duplicate mind with id:', m.id);
                            return false;
                        }
                        seenIds.add(m.id);
                        return true;
                    });
                    console.log('[Playground] upsert_mind response handler - resulting minds:', deduplicated.map(m => ({ id: m.id, name: m.name, preview: m._preview })));
                    mindsRef.current = deduplicated;
                    return deduplicated;
                });
            }
            else if (data.action === 'upsert_mental' && data.data?.mental_sphere) {
                const mental = data.data.mental_sphere as MentalData;
                const variable = data.request_id ? pendingMentalsRef.current.get(data.request_id) : undefined;
                if (variable && data.request_id) {
                    variableToIdRef.current.set(variable, { type: 'mental', id: mental.id });
                    pendingMentalsRef.current.delete(data.request_id);
                }
                setMentals((prev) => {
                    const existing = prev.find((m) => m.id === mental.id);
                    const existingVariable = existing?.variable || variable;
                    const filtered = prev.filter((m) => !(m._preview && m.id === mental.id));
                    const updatedMental: MentalData = { ...mental, variable: existingVariable };
                    const nonPreviewExisting = filtered.find((m) => !m._preview && m.id === mental.id);
                    const next = nonPreviewExisting
                        ? filtered.map((m) => (m.id === mental.id && !m._preview ? updatedMental : m))
                        : [...filtered, updatedMental];
                    mentalsRef.current = next;
                    return next;
                });
            }
            else if (data.action === 'append_mental' && data.data) {
                const mindId = data.data.mind_id as number;
                const mentalIds = (data.data.mental_sphere_ids || []) as number[];
                setMinds((prev) => {
                    const next = prev.map((m) => (m.id === mindId ? { ...m, mental_sphere_ids: mentalIds } : m));
                    mindsRef.current = next;
                    return next;
                });
            }
        }
        else if (data.type === 'update') {
            if (data.action === 'mind_updated' && data.data) {
                const mind = data.data as MindData;
                if (!mind.name || typeof mind.scale !== 'number' || !Array.isArray(mind.position)) {
                    return;
                }
                setMinds((prev) => {
                    console.log('[Playground] mind_updated broadcast handler - current minds:', prev.map(m => ({ id: m.id, name: m.name, preview: m._preview })));
                    const filtered = prev.filter((m) => !(m._preview && m.id === mind.id));
                    const existing = filtered.find((m) => !m._preview && m.id === mind.id);
                    console.log('[Playground] mind_updated broadcast - existing mind found:', existing ? { id: existing.id, name: existing.name } : 'none');
                    if (!existing) {
                        console.log('[Playground] mind_updated broadcast - ignoring, mind not found in current state');
                        return prev;
                    }
                    const preservedMentalSphereIds = existing.mental_sphere_ids && existing.mental_sphere_ids.length > 0
                        ? existing.mental_sphere_ids
                        : (mind.mental_sphere_ids && mind.mental_sphere_ids.length > 0 ? mind.mental_sphere_ids : []);
                    const updatedMind: MindData = {
                        ...mind,
                        variable: existing.variable,
                        mental_sphere_ids: preservedMentalSphereIds
                    };
                    const next = filtered.map((m) => (m.id === mind.id && !m._preview ? updatedMind : m));
                    console.log('[Playground] mind_updated broadcast handler - resulting minds:', next.map(m => ({ id: m.id, name: m.name, preview: m._preview })));
                    mindsRef.current = next;
                    return next;
                });
            }
            else if (data.action === 'upsert_mental' && data.data?.mental_sphere) {
                const mental = data.data.mental_sphere as MentalData;
                setMentals((prev) => {
                    const existing = prev.find((m) => !m._preview && m.id === mental.id);
                    if (!existing) {
                        return prev;
                    }
                    const updatedMental: MentalData = { ...mental, variable: existing.variable };
                    const next = prev.map((m) => (m.id === mental.id && !m._preview ? updatedMental : m));
                    mentalsRef.current = next;
                    return next;
                });
            }
        }
        else if (data.type === 'preview') {
            if (data.action === 'upsert_mind' && data.data?.mind) {
                const mind = data.data.mind as MindData;
                const variable = data.request_id ? pendingMindsRef.current.get(data.request_id) : undefined;
                const previewMind: MindData = { ...mind, variable, _preview: true };
                setMinds((prev) => {
                    const existing = prev.find((m) => m._preview && m.id === mind.id);
                    const next = existing
                        ? prev.map((m) => (m._preview && m.id === mind.id ? previewMind : m))
                        : [...prev, previewMind];
                    mindsRef.current = next;
                    return next;
                });
            }
            else if (data.action === 'upsert_mental' && data.data?.mental_sphere) {
                const mental = data.data.mental_sphere as MentalData;
                const variable = data.request_id ? pendingMentalsRef.current.get(data.request_id) : undefined;
                const previewMental: MentalData = { ...mental, variable, _preview: true };
                setMentals((prev) => {
                    const existing = prev.find((m) => m._preview && m.id === mental.id);
                    const next = existing
                        ? prev.map((m) => (m._preview && m.id === mental.id ? previewMental : m))
                        : [...prev, previewMental];
                    mentalsRef.current = next;
                    return next;
                });
            }
        }
    };
    const handleCodeChange = React.useCallback((newCode: string) => {
        setCode(newCode);
        if (liveUpdateTimerRef.current) {
            window.clearTimeout(liveUpdateTimerRef.current);
        }
        liveUpdateTimerRef.current = window.setTimeout(() => {
            handleExecute(newCode);
        }, 450);
    }, []);
    const updateMentalAttribute = (variable: string, attribute: string, value: string) => {
        setMentals((prev) => {
            const next = prev.map((m) => {
                if (m.variable !== variable)
                    return m;
                if (attribute === 'color')
                    return { ...m, color: value };
                if (attribute === 'name')
                    return { ...m, name: value };
                if (attribute === 'scale')
                    return { ...m, scale: Number.parseFloat(value) || m.scale };
                return m;
            });
            mentalsRef.current = next;
            return next;
        });
    };
    const handleExecute = (codeToExecute: string) => {
        console.log('[Playground] handleExecute called with code:', codeToExecute);
        const client = wsClientRef.current;
        if (!client || !client.connected) {
            alert('WebSocket not connected. Please wait...');
            return;
        }
        const runId = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
        currentRunIdRef.current = runId;
        const rid = (suffix: string) => `${runId}:${suffix}`;
        setMinds([]);
        setMentals([]);
        mindsRef.current = [];
        mentalsRef.current = [];
        variableToIdRef.current.clear();
        pendingMindsRef.current.clear();
        pendingMentalsRef.current.clear();
        if (!codeToExecute || !codeToExecute.trim()) {
            return;
        }
        try {
            const parser = new CodeParser();
            const actions = parser.parse(codeToExecute);
            console.log('[Playground] Parsed actions:', actions);
            if (actions.length === 0) {
                console.log('[Playground] No actions to execute');
                return;
            }
            const batchedActions: ParsedAction[] = [];
            let i = 0;
            while (i < actions.length) {
                const action = actions[i];
                if (action.type === 'update_mind_attribute') {
                    const batchedUpdate: {
                        variable: string;
                        attributes: Record<string, string>;
                    } = {
                        variable: action.variable,
                        attributes: { [action.attribute]: action.value },
                    };
                    i++;
                    while (i < actions.length && actions[i].type === 'update_mind_attribute' && actions[i].variable === batchedUpdate.variable) {
                        batchedUpdate.attributes[actions[i].attribute] = actions[i].value;
                        i++;
                    }
                    batchedActions.push({
                        type: 'update_mind_attribute_batch',
                        variable: batchedUpdate.variable,
                        attributes: batchedUpdate.attributes,
                    } as any);
                }
                else if (action.type === 'update_mental_attribute') {
                    const batchedUpdate: {
                        variable: string;
                        attributes: Record<string, string>;
                    } = {
                        variable: action.variable,
                        attributes: { [action.attribute]: action.value },
                    };
                    i++;
                    while (i < actions.length && actions[i].type === 'update_mental_attribute' && actions[i].variable === batchedUpdate.variable) {
                        batchedUpdate.attributes[actions[i].attribute] = actions[i].value;
                        i++;
                    }
                    batchedActions.push({
                        type: 'update_mental_attribute_batch',
                        variable: batchedUpdate.variable,
                        attributes: batchedUpdate.attributes,
                    } as any);
                }
                else {
                    batchedActions.push(action);
                    i++;
                }
            }
            console.log('[Playground] Batched actions:', batchedActions);
            batchedActions.forEach((action: ParsedAction, index: number) => {
                setTimeout(() => {
                    console.log(`[Playground] Executing action ${index + 1}/${batchedActions.length}:`, action);
                    switch (action.type) {
                        case 'create_mind': {
                            const requestId = rid(`mind_${action.variable}_${Date.now()}_${index}`);
                            pendingMindsRef.current.set(requestId, action.variable);
                            client.send({
                                action: 'upsert_mind',
                                data: {
                                    name: action.data.name || 'My Mind',
                                    detail: '',
                                    color: action.data.color || '#ffffff',
                                    position: action.data.position || [0, 0, 0],
                                    rotation: action.data.rotation || [0, 0, 0],
                                    scale: action.data.scale || 1.5,
                                    rec_status: true,
                                },
                                request_id: requestId,
                            });
                            break;
                        }
                        case 'update_mind_attribute_batch': {
                            const batchedAction = action as any;
                            const mindVarInfo = variableToIdRef.current.get(batchedAction.variable);
                            const mind = mindsRef.current.find((m) => !m._preview &&
                                (m.variable === batchedAction.variable || (mindVarInfo && mindVarInfo.type === 'mind' && mindVarInfo.id === m.id)));
                            if (mind) {
                                const updatedMind: MindData = { ...mind };
                                if (batchedAction.attributes.color !== undefined) {
                                    updatedMind.color = batchedAction.attributes.color;
                                }
                                if (batchedAction.attributes.name !== undefined) {
                                    updatedMind.name = batchedAction.attributes.name;
                                }
                                if (batchedAction.attributes.scale !== undefined) {
                                    updatedMind.scale = Number.parseFloat(batchedAction.attributes.scale) || updatedMind.scale;
                                }
                                setMinds((prev) => {
                                    const next = prev.map((m) => (m.id === mind.id && !m._preview ? updatedMind : m));
                                    mindsRef.current = next;
                                    return next;
                                });
                                client.send({
                                    action: 'upsert_mind',
                                    data: {
                                        id: mind.id,
                                        name: updatedMind.name,
                                        detail: mind.detail || '',
                                        color: updatedMind.color,
                                        position: mind.position || [0, 0, 0],
                                        rotation: mind.rotation || [0, 0, 0],
                                        scale: updatedMind.scale,
                                        rec_status: true,
                                    },
                                    request_id: rid(`update_${batchedAction.variable}_batch_${Date.now()}`),
                                });
                            }
                            else {
                                console.warn(`Mind with variable ${batchedAction.variable} not found yet. Waiting for creation...`);
                                setTimeout(() => {
                                    const retryMind = mindsRef.current.find((m) => !m._preview &&
                                        (m.variable === batchedAction.variable ||
                                            (mindVarInfo && mindVarInfo.id === m.id)));
                                    if (retryMind) {
                                        handleExecute(codeToExecute);
                                    }
                                }, 500);
                            }
                            break;
                        }
                        case 'update_mind_attribute': {
                            const mindVarInfo = variableToIdRef.current.get(action.variable);
                            const mind = mindsRef.current.find((m) => !m._preview &&
                                (m.variable === action.variable || (mindVarInfo && mindVarInfo.type === 'mind' && mindVarInfo.id === m.id)));
                            if (mind) {
                                const updatedMind: MindData = { ...mind };
                                if (action.attribute === 'color') {
                                    updatedMind.color = action.value;
                                }
                                else if (action.attribute === 'name') {
                                    updatedMind.name = action.value;
                                }
                                else if (action.attribute === 'scale') {
                                    updatedMind.scale = Number.parseFloat(action.value) || updatedMind.scale;
                                }
                                setMinds((prev) => {
                                    const next = prev.map((m) => (m.id === mind.id && !m._preview ? updatedMind : m));
                                    mindsRef.current = next;
                                    return next;
                                });
                                client.send({
                                    action: 'upsert_mind',
                                    data: {
                                        id: mind.id,
                                        name: updatedMind.name,
                                        detail: mind.detail || '',
                                        color: updatedMind.color,
                                        position: mind.position || [0, 0, 0],
                                        rotation: mind.rotation || [0, 0, 0],
                                        scale: updatedMind.scale,
                                        rec_status: true,
                                    },
                                    request_id: rid(`update_${action.variable}_${action.attribute}_${Date.now()}`),
                                });
                            }
                            else {
                                console.warn(`Mind with variable ${action.variable} not found yet. Waiting for creation...`);
                                setTimeout(() => {
                                    const retryMind = mindsRef.current.find((m) => !m._preview &&
                                        (m.variable === action.variable ||
                                            (mindVarInfo && mindVarInfo.id === m.id)));
                                    if (retryMind) {
                                        handleExecute(codeToExecute);
                                    }
                                }, 500);
                            }
                            break;
                        }
                        case 'create_mental': {
                            const requestId = rid(`mental_${action.variable}_${Date.now()}_${index}`);
                            pendingMentalsRef.current.set(requestId, action.variable);
                            client.send({
                                action: 'upsert_mental',
                                data: {
                                    name: action.data.name || 'Mental Sphere',
                                    detail: '',
                                    color: action.data.color || '#ff6b9d',
                                    image: '',
                                    position: action.data.position || [0.3, 0.2, 0.1],
                                    rotation: [0, 0, 0],
                                    scale: action.data.scale || 0.1,
                                    rec_status: true,
                                },
                                request_id: requestId,
                            });
                            break;
                        }
                        case 'update_mental_attribute_batch': {
                            const batchedAction = action as any;
                            const mentalVarInfo = variableToIdRef.current.get(batchedAction.variable);
                            const mental = mentalsRef.current.find((m) => !m._preview &&
                                (m.variable === batchedAction.variable || (mentalVarInfo && mentalVarInfo.type === 'mental' && mentalVarInfo.id === m.id)));
                            if (mental) {
                                const updatedMental: MentalData = { ...mental };
                                if (batchedAction.attributes.color !== undefined) {
                                    updatedMental.color = batchedAction.attributes.color;
                                }
                                if (batchedAction.attributes.name !== undefined) {
                                    updatedMental.name = batchedAction.attributes.name;
                                }
                                if (batchedAction.attributes.scale !== undefined) {
                                    updatedMental.scale = Number.parseFloat(batchedAction.attributes.scale) || updatedMental.scale;
                                }
                                setMentals((prev) => {
                                    const next = prev.map((m) => (m.id === mental.id && !m._preview ? updatedMental : m));
                                    mentalsRef.current = next;
                                    return next;
                                });
                                client.send({
                                    action: 'upsert_mental',
                                    data: {
                                        id: mental.id,
                                        name: updatedMental.name,
                                        detail: '',
                                        color: updatedMental.color,
                                        image: '',
                                        position: mental.position || [0.3, 0.2, 0.1],
                                        rotation: [0, 0, 0],
                                        scale: updatedMental.scale,
                                        rec_status: true,
                                    },
                                    request_id: rid(`update_${batchedAction.variable}_batch_${Date.now()}`),
                                });
                            }
                            else {
                                console.warn(`Mental sphere with variable ${batchedAction.variable} not found yet. Waiting for creation...`);
                                setTimeout(() => {
                                    const retryMental = mentalsRef.current.find((m) => !m._preview &&
                                        (m.variable === batchedAction.variable ||
                                            (mentalVarInfo && mentalVarInfo.id === m.id)));
                                    if (retryMental) {
                                        setTimeout(() => handleExecute(codeToExecute), 0);
                                    }
                                }, 500);
                            }
                            break;
                        }
                        case 'update_mental_attribute': {
                            const mentalVarInfo = variableToIdRef.current.get(action.variable);
                            const mental = mentalsRef.current.find((m) => !m._preview &&
                                (m.variable === action.variable || (mentalVarInfo && mentalVarInfo.type === 'mental' && mentalVarInfo.id === m.id)));
                            if (mental) {
                                const updatedMental: MentalData = { ...mental };
                                if (action.attribute === 'color') {
                                    updatedMental.color = action.value;
                                }
                                else if (action.attribute === 'name') {
                                    updatedMental.name = action.value;
                                }
                                else if (action.attribute === 'scale') {
                                    updatedMental.scale = Number.parseFloat(action.value) || updatedMental.scale;
                                }
                                setMentals((prev) => {
                                    const next = prev.map((m) => (m.id === mental.id && !m._preview ? updatedMental : m));
                                    mentalsRef.current = next;
                                    return next;
                                });
                                client.send({
                                    action: 'upsert_mental',
                                    data: {
                                        id: mental.id,
                                        name: updatedMental.name,
                                        detail: '',
                                        color: updatedMental.color,
                                        image: '',
                                        position: mental.position || [0.3, 0.2, 0.1],
                                        rotation: [0, 0, 0],
                                        scale: updatedMental.scale,
                                        rec_status: true,
                                    },
                                    request_id: rid(`update_${action.variable}_${action.attribute}_${Date.now()}`),
                                });
                            }
                            else {
                                console.warn(`Mental sphere with variable ${action.variable} not found yet. Waiting for creation...`);
                                setTimeout(() => {
                                    const retryMental = mentalsRef.current.find((m) => !m._preview &&
                                        (m.variable === action.variable ||
                                            (mentalVarInfo && mentalVarInfo.id === m.id)));
                                    if (retryMental) {
                                        setTimeout(() => handleExecute(codeToExecute), 0);
                                    }
                                }, 500);
                            }
                            break;
                        }
                        case 'add_mental_to_mind': {
                            const mindVar = action.mindVariable;
                            const mentalVar = action.mentalVariable;
                            const tryAddMental = () => {
                                const currentMinds = mindsRef.current;
                                const currentMentals = mentalsRef.current;
                                const targetMind = currentMinds.find((m) => !m._preview &&
                                    (m.variable === mindVar || variableToIdRef.current.get(mindVar)?.id === m.id));
                                const mentalVarInfo = variableToIdRef.current.get(mentalVar);
                                const targetMental = currentMentals.find((m) => !m._preview &&
                                    (m.variable === mentalVar ||
                                        (mentalVarInfo && mentalVarInfo.type === 'mental' && mentalVarInfo.id === m.id)));
                                if (targetMind && targetMental) {
                                    client.send({
                                        action: 'append_mental',
                                        data: {
                                            mind_id: targetMind.id,
                                            sphere_id: [targetMental.id],
                                        },
                                        request_id: rid(`add_${mindVar}_${mentalVar}_${Date.now()}`),
                                    });
                                    return true;
                                }
                                return false;
                            };
                            if (!tryAddMental()) {
                                let retryCount = 0;
                                const maxRetries = 10;
                                const retryInterval = 500;
                                const retryAddMental = () => {
                                    retryCount++;
                                    if (tryAddMental()) {
                                        return;
                                    }
                                    if (retryCount < maxRetries) {
                                        setTimeout(retryAddMental, retryInterval);
                                    }
                                    else {
                                        console.warn(`Mind ${mindVar} or Mental ${mentalVar} not found after ${maxRetries} retries`);
                                    }
                                };
                                setTimeout(retryAddMental, retryInterval);
                            }
                            break;
                        }
                    }
                }, index * 200);
            });
        }
        catch (error: unknown) {
            console.error('Error executing code:', error);
            const message = error instanceof Error ? error.message : String(error);
            alert(`Error: ${message}`);
        }
    };
    useEffect(() => {
        return () => {
            if (liveUpdateTimerRef.current) {
                window.clearTimeout(liveUpdateTimerRef.current);
            }
        };
    }, []);
    return (<main className="page">
      <div className="playground">
        <section className="playground-left">
          <div className="playground-header">
            <div>
              <h1 className="playground-title">Playground</h1>
              <p className="playground-subtitle">
                Build your code using visual blocks. The 3D scene will update in real-time.
              </p>
            </div>
            <div className="playground-meta">
              <span style={{
            color: connectionStatus === 'connected' ? '#10b981' : '#ef4444',
            fontSize: '10px',
            marginRight: '8px',
        }}>
                ●
              </span>
              {connectionStatus}
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <VisualCodeEditor onCodeChange={handleCodeChange} onExecute={handleExecute}/>
          </div>
        </section>

        <section className="playground-right">
          <div className="playground-canvas-wrap">
            <div className="playground-canvas">
              <MindWebsiteScene minds={minds.filter((m) => !m._preview)} mentals={mentals.filter((m) => {
            if (m._preview)
                return false;
            const isInAnyMind = minds.some(mind => mind.mental_sphere_ids &&
                Array.isArray(mind.mental_sphere_ids) &&
                mind.mental_sphere_ids.includes(m.id));
            return isInAnyMind;
        })}/>
            </div>
          </div>
        </section>
      </div>
    </main>);
}
