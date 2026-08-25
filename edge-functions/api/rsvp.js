// RSVP 登记接口
// 路由：/api/rsvp（POST 宾客提交 / GET 管理员查询）
// 依赖：控制台绑定 KV 命名空间，变量名 rsvp_kv；环境变量 ADMIN_TOKEN 为管理口令

const LIST_KEY = 'rsvp_list';

// 与 index.html 保持一致的输入校验规则
const NAME_PATTERN = /^[一-龥A-Za-z\s·.]+$/;
const PHONE_PATTERN = /^[0-9+\-\s]{6,20}$/;
const ACCOMMODATION_VALUES = ['需要', '不需要', '待定'];

function json(data, status) {
    return new Response(JSON.stringify(data), {
        status: status || 200,
        headers: {
            'content-type': 'application/json; charset=UTF-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type, authorization',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
    });
}

// 校验并规范化提交数据；不合法返回错误消息字符串，合法返回 null
function validate(body) {
    if (!body || typeof body !== 'object') return '请求数据格式不正确。';
    const name = String(body.name || '').trim();
    const accommodation = String(body.accommodation || '').trim();
    const phone = String(body.phone || '').trim();

    if (name === '') return '请填写您的姓名。';
    if (name.length > 30 || !NAME_PATTERN.test(name)) return '姓名格式不正确。';
    if (ACCOMMODATION_VALUES.indexOf(accommodation) === -1) return '请选择是否需要住宿。';
    if (phone !== '' && !PHONE_PATTERN.test(phone)) return '联系电话格式不正确。';
    return null;
}

async function readList() {
    try {
        const raw = await rsvp_kv.get(LIST_KEY, { type: 'json' });
        return Array.isArray(raw) ? raw : [];
    } catch (e) {
        throw new Error('KV 存储未绑定，请在控制台为项目绑定变量名为 rsvp_kv 的命名空间');
    }
}

async function writeList(list) {
    await rsvp_kv.put(LIST_KEY, JSON.stringify(list));
}

// 宾客提交：同名视为修改，否则追加
export async function onRequestPost({ request }) {
    try {
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return json({ ok: false, error: '请求数据格式不正确。' }, 400);
        }

        const error = validate(body);
        if (error) return json({ ok: false, error }, 400);

        const name = String(body.name).trim();
        const accommodation = String(body.accommodation).trim();
        const phone = String(body.phone || '').trim();

        const list = await readList();
        const existing = list.find(r => r.name === name);
        if (existing) {
            existing.accommodation = accommodation;
            existing.phone = phone;
            existing.updatedAt = new Date().toISOString();
        } else {
            list.push({
                name: name,
                accommodation: accommodation,
                phone: phone,
                createdAt: new Date().toISOString(),
                updatedAt: null,
            });
        }
        await writeList(list);

        return json({ ok: true, total: list.length });
    } catch (err) {
        return json({ ok: false, error: err.message || '服务暂时不可用，请稍后再试。' }, 500);
    }
}

// 管理查询：校验口令（Authorization: Bearer xxx 或 ?token=xxx）
export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const token = url.searchParams.get('token') ||
            (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');

        if (!env || !env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
            return json({ ok: false, error: '口令不正确。' }, 401);
        }

        const list = await readList();
        return json({ ok: true, total: list.length, list: list });
    } catch (err) {
        return json({ ok: false, error: err.message || '服务暂时不可用。' }, 500);
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'content-type, authorization',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        },
    });
}
