// RSVP 名单 CSV 导出
// 路由：/api/rsvp-export（GET，需管理口令，同 /api/rsvp 的校验方式）
// 输出带 UTF-8 BOM 的 CSV，保证 Excel 直接打开中文不乱码

const LIST_KEY = 'rsvp_list';

// CSV 字段转义：含逗号/引号/换行时用双引号包裹并转义内部引号
function csvCell(value) {
    const s = String(value === null || value === undefined ? '' : value);
    if (/[",\n\r]/.test(s)) {
        return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
}

function formatTime(iso) {
    if (!iso) return '';
    try {
        return new Date(iso).toLocaleString('zh-CN', { hour12: false });
    } catch (e) {
        return iso;
    }
}

export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const token = url.searchParams.get('token') ||
            (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');

        if (!env || !env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) {
            return new Response(JSON.stringify({ ok: false, error: '口令不正确。' }), {
                status: 401,
                headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
        }

        let list;
        try {
            const raw = await rsvp_kv.get(LIST_KEY, { type: 'json' });
            list = Array.isArray(raw) ? raw : [];
        } catch (e) {
            return new Response(JSON.stringify({ ok: false, error: 'KV 存储未绑定。' }), {
                status: 500,
                headers: { 'content-type': 'application/json; charset=UTF-8' },
            });
        }

        const header = ['提交时间', '姓名', '是否需要住宿', '联系电话'].map(csvCell).join(',');
        const rows = list.map(r =>
            [formatTime(r.createdAt), r.name, r.accommodation, r.phone].map(csvCell).join(',')
        );
        // 用转义写法写入 UTF-8 BOM（﻿），保证 Excel 识别编码
        const csv = '\ufeff' + header + '\r\n' + rows.join('\r\n') + '\r\n';

        return new Response(csv, {
            headers: {
                'content-type': 'text/csv; charset=UTF-8',
                'Content-Disposition': 'attachment; filename="rsvp_list.csv"',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: '服务暂时不可用。' }), {
            status: 500,
            headers: { 'content-type': 'application/json; charset=UTF-8' },
        });
    }
}
