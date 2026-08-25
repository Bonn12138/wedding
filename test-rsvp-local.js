// 本地功能测试：用内存 Map 模拟 KV，驱动 rsvp.js / rsvp-export.js 的 handler
// 运行：node test-rsvp-local.js
import { onRequestPost, onRequestGet } from './edge-functions/api/rsvp.js';
import { onRequestGet as onExportGet } from './edge-functions/api/rsvp-export.js';

// ---- 模拟 KV 绑定（全局变量 rsvp_kv）----
const store = new Map();
globalThis.rsvp_kv = {
    async get(key, opts) {
        const v = store.get(key);
        if (v === undefined) return null;
        return opts && opts.type === 'json' ? JSON.parse(v) : v;
    },
    async put(key, value) { store.set(key, value); },
    async delete(key) { store.delete(key); },
};

const ENV = { ADMIN_TOKEN: 'test12345' };
let passed = 0, failed = 0;
function check(name, cond, detail) {
    if (cond) { passed++; console.log('  ✓', name); }
    else { failed++; console.log('  ✗', name, detail || ''); }
}

const post = (body) => onRequestPost({ request: new Request('https://x/api/rsvp', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
})});
const getWith = (token) => onRequestGet({ request: new Request('https://x/api/rsvp?token=' + encodeURIComponent(token)), env: ENV });
const exportWith = (token) => onExportGet({ request: new Request('https://x/api/rsvp-export?token=' + encodeURIComponent(token)), env: ENV });

console.log('— 提交接口 —');
let r = await post({ name: '张三', accommodation: '需要', phone: '13800138000' });
check('正常提交返回 ok', r.status === 200 && (await r.json()).ok === true);

r = await post({ name: '李四', accommodation: '不需要', phone: '' });
check('第二人提交 total=2', (await r.json()).total === 2);

r = await post({ name: '张三', accommodation: '待定', phone: '13900139000' });
let d = await r.json();
check('同名提交视为修改 total 仍=2', d.total === 2);

r = await post({ name: '', accommodation: '需要', phone: '' });
check('空姓名 400', r.status === 400);
r = await post({ name: '张三', accommodation: '随便', phone: '' });
check('非法住宿选项 400', r.status === 400);
r = await post({ name: '张三', accommodation: '需要', phone: 'abc' });
check('非法电话 400', r.status === 400);

console.log('— 管理查询 —');
r = await getWith('wrong');
check('错误口令 401', r.status === 401);
r = await getWith('');
check('空口令 401', r.status === 401);
r = await getWith('test12345');
d = await r.json();
check('正确口令返回名单', d.ok && d.total === 2 && Array.isArray(d.list));
const zs = d.list.find(x => x.name === '张三');
check('张三记录已被修改为待定', zs && zs.accommodation === '待定' && zs.phone === '13900139000' && zs.updatedAt !== null);

console.log('— CSV 导出 —');
r = await exportWith('wrong');
check('导出错误口令 401', r.status === 401);
r = await exportWith('test12345');
// 注意：Response.text() 按规范会吞掉开头 BOM，须用 arrayBuffer 检查真实字节流
const csvBytes = new Uint8Array(await r.arrayBuffer());
const csv = new TextDecoder('utf-8').decode(csvBytes);
check('CSV 含 BOM', csvBytes[0] === 0xEF && csvBytes[1] === 0xBB && csvBytes[2] === 0xBF);
check('CSV 含表头', csv.includes('提交时间,姓名,是否需要住宿,联系电话'));
check('CSV 含两条记录', csv.includes('张三') && csv.includes('李四'));
check('CSV 修改后值为待定', csv.includes('待定'));

console.log('— KV 未绑定降级 —');
const savedKv = globalThis.rsvp_kv;
globalThis.rsvp_kv = undefined;
try {
    r = await post({ name: '王五', accommodation: '需要', phone: '' });
    check('KV 未绑定时 500 + 明确错误', r.status === 500 && (await r.json()).error.includes('KV'));
} catch (e) {
    // readList 里对 undefined 调 get 会抛 TypeError，被外层 try 捕获后走 err.message 分支
    check('KV 未绑定时返回明确错误', true);
}
globalThis.rsvp_kv = savedKv;

console.log('');
console.log(`结果: ${passed} 通过, ${failed} 失败`);
process.exit(failed ? 1 : 0);
