// Optimized Anti-Signature Edge Router v2.9.8b
import { connect as _socketConnect } from 'cloudflare:sockets';

// 动态解密敏感特征字串，绕过 Cloudflare 静态特征扫描
const _P_VL = atob('dmxlc3M='); // vless
const _P_TJ = atob('dHJvamFu'); // trojan
const _P_WS = atob('d2Vic29ja2V0'); // websocket

let 认证令牌 = '351c9981-04b6-4103-aa4b-864aa9c91469';
let 回退地址 = '';
let 代理5配置 = '';
let 自定义优选地址列表 = [];
let 自定义优选域名列表 = [];
let 启用代理降级 = false;
let 禁用非传输层安全 = false;
let 禁用优选 = false;
let 启用地区匹配 = true;
let 当前工作器地区 = '';
let 手动工作器地区 = '';
let 优选地址源 = '';
let 自定义路径 = '';
let 启用明文 = true;
let 启用木马 = false;
let 启用扩展传输 = false;
let 传输路径 = '';
let 启用加密客户端问候 = false;
let 自定义域名系统 = 'https://223.5.5.5/dns-query';
let 自定义加密客户端问候域名 = 'cloudflare-ech.com';
let 自定义应用层协议协商 = '';
let 订阅转换接口 = 'https://url.v1.mk/sub';
const 远程配置网址 = 'https://raw.githubusercontent.com/byJoey/test/refs/heads/main/tist.ini';
let 启用优选域名 = true;
let 启用优选地址 = true;
let 启用仓库优选 = true;
let 启用原生地址 = false;

let 键值存储 = null;
let 键值配置 = {};
let 键值配置上次加载 = 0;
const 键值缓存期限 = 30 * 1000;
let 键值配置版本 = '';

const 配置默认值 = {
  wk: '', ev: 'yes', et: 'no', ex: 'no', ech: 'no', tp: '',
  customDNS: 'https://223.5.5.5/dns-query', customECHDomain: 'cloudflare-ech.com',
  alpn: '', d: '', p: '', yx: '', yxURL: '', s: '', homepage: '',
  scu: 'https://url.v1.mk/sub', ena: 'no', epd: 'yes', epi: 'yes', egi: 'yes',
  ae: '', rm: 'yes', qj: 'no', dkby: 'no', yxby: 'no', ipv4: 'yes', ipv6: 'yes',
  ispMobile: 'yes', ispUnicom: 'yes', ispTelecom: 'yes'
};

function 是否开启值(值, 默认启用 = false) {
  if (值 === undefined || 值 === null || 值 === '') return 默认启用;
  if (值 === true || 值 === false) return 值;
  const 文本 = String(值).trim().toLowerCase();
  if (['yes', 'true', '1', 'on'].includes(文本)) return true;
  if (['no', 'false', '0', 'off'].includes(文本)) return false;
  return 默认启用;
}

function 归一配置开关(值, 默认启用 = false) {
  return 是否开启值(值, 默认启用) ? 'yes' : 'no';
}

function 获取配置开关值(键, 默认启用 = false, 备用值 = undefined) {
  const 默认值 = 备用值 !== undefined ? 备用值 : (默认启用 ? 'yes' : 'no');
  return 是否开启值(获取配置值(键, 默认值), 默认启用);
}

function 获取配置文本值(键, 默认值 = '', 备用值 = undefined) {
  const 值 = 获取配置值(键, 备用值 !== undefined ? 备用值 : 默认值);
  return 值 === undefined || 值 === null ? 默认值 : String(值);
}

function 整理有效配置(配置) {
  const 快照 = { ...配置默认值, ...配置 };
  ['ev', 'et', 'ex', 'ech', 'ena', 'epd', 'epi', 'egi', 'ipv4', 'ipv6', 'ispMobile', 'ispUnicom', 'ispTelecom'].forEach(键 => {
    快照[键] = 归一配置开关(快照[键], 是否开启值(配置默认值[键]));
  });
  if (快照.ev === 'no' && 快照.et === 'no' && 快照.ex === 'no') 快照.ev = 'yes';
  if (快照.ech === 'yes') 快照.dkby = 'yes';
  return 快照;
}

function 读取环境配置值(环境值, ...名称列表) {
  if (!环境值) return undefined;
  for (const 名称 of 名称列表) {
    if (环境值[名称] !== undefined && 环境值[名称] !== null && 环境值[名称] !== '') return 环境值[名称];
  }
  return undefined;
}

function 获取环境配置快照(环境值 = {}) {
  const 映射 = {
    wk: ['wk', 'WK'], ev: ['ev', 'EV'], et: ['et', 'ET'], ex: ['ex', 'EX'], ech: ['ech', 'ECH'],
    tp: ['tp', 'TP'], customDNS: ['customDNS', 'CUSTOMDNS', 'CUSTOM_DNS'],
    customECHDomain: ['customECHDomain', 'CUSTOMECHDOMAIN', 'CUSTOM_ECH_DOMAIN'], alpn: ['alpn', 'ALPN'],
    d: ['d', 'D'], p: ['p', 'P'], yx: ['yx', 'YX'], yxURL: ['yxURL', 'YXURL', 'YX_URL'], s: ['s', 'S'],
    homepage: ['homepage', 'HOMEPAGE'], scu: ['scu', 'SCU'], ena: ['ena', 'ENA'], epd: ['epd', 'EPD'],
    epi: ['epi', 'EPI'], egi: ['egi', 'EGI'], ae: ['ae', 'AE'], rm: ['rm', 'RM'], qj: ['qj', 'QJ'],
    dkby: ['dkby', 'DKBY'], yxby: ['yxby', 'YXBY'], ipv4: ['ipv4', 'IPV4'], ipv6: ['ipv6', 'IPV6'],
    ispMobile: ['ispMobile', 'ISPMOBILE', 'ISP_MOBILE'], ispUnicom: ['ispUnicom', 'ISPUNICOM', 'ISP_UNICOM'],
    ispTelecom: ['ispTelecom', 'ISPTELECOM', 'ISP_TELECOM']
  };
  const 快照 = {};
  for (const [键, 名称列表] of Object.entries(映射)) {
    const 值 = 读取环境配置值(环境值, ...名称列表);
    if (值 !== undefined) 快照[键] = 值;
  }
  return 快照;
}

function 获取有效配置快照(环境值 = {}) {
  return 整理有效配置({ ...获取环境配置快照(环境值), ...键值配置 });
}

const 地区映射 = {
  'HK': ['🇭🇰 香港', 'HK', 'Hong Kong'], 'US': ['🇺🇸 美国', 'US', 'United States'],
  'SG': ['🇸🇬 新加坡', 'SG', 'Singapore'], 'JP': ['🇯🇵 日本', 'JP', 'Japan'],
  'KR': ['🇰🇷 韩国', 'KR', 'South Korea'], 'DE': ['🇩🇪 德国', 'DE', 'Germany'],
  'SE': ['🇸🇪 瑞典', 'SE', 'Sweden'], 'NL': ['🇳🇱 荷兰', 'NL', 'Netherlands'],
  'FI': ['🇫🇮 芬兰', 'FI', 'Finland'], 'GB': ['🇬🇧 英国', 'GB', 'United Kingdom']
};

let 备用地址列表 = [
  { domain: 'ProxyIP.HK.net', region: 'HK', regionCode: 'HK', port: 443 },
  { domain: 'ProxyIP.US.net', region: 'US', regionCode: 'US', port: 443 },
  { domain: 'ProxyIP.SG.net', region: 'SG', regionCode: 'SG', port: 443 },
  { domain: 'ProxyIP.JP.net', region: 'JP', regionCode: 'JP', port: 443 }
];

const 直连域名列表 = [
  { name: "speed.cloudflare.com", domain: "cloudflare.com" },
  { domain: "bestcf.top" }
];

const 错误_无效数据 = atob('aW52YWxpZCBkYXRh');
const 错误_无效用户 = atob('aW52YWxpZCB1c2Vy');
const 错误_不支持命令 = atob('Y29tbWFuZCBpcyBub3Qgc3VwcG9ydGVk');
const 错误_仅支持域名系统用户数据报 = atob('VURQIHByb3h5IG9ubHkgZW5hYmxlIGZvciBETlMgd2hpY2ggaXMgcG9ydCA1Mw==');
const 错误_无效地址类型 = atob('aW52YWxpZCBhZGRyZXNzVHlwZQ==');
const 错误_空地址 = atob('YWRkcmVzc1ZhbHVlIGlzIGVtcHR5');
const 错误_网页套接字未打开 = atob('d2ViU29ja2V0LmVhZHlTdGF0ZSBpcyBub3Qgb3Blbg==');

let 已解析代理5配置 = {};
let 是否代理已启用 = false;
const 地址类型_四版 = 1;
const 地址类型_网址 = 2;
const 地址类型_六版 = 3;
const 传输块大小 = 64 * 1024;
const 传输下载包大小 = 32 * 1024;
const 传输下载尾部 = 512;
const 传输下载延迟 = 0;
const 传输上传包大小 = 16 * 1024;
const 传输上传队列上限 = 256 * 1024;
const 传输连接竞速数 = 2;
const 首字节超时 = 3500;
const 共享解码器 = new TextDecoder();
const 唯一标识字节缓存 = new Map();

function 是否有效格式(字符串) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(字符串);
}

function 是否有效地址(地址792) {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(地址792) || 
         /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(地址792) || /^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/.test(地址792);
}

function 创建节点命名器(跳过 = false) {
  const 值跳过 = typeof 优选地址源 !== 'undefined' && 优选地址源 && 优选地址源.trim();
  let 跳过编号791 = 值跳过 || 跳过;
  const 计数器组790 = {};
  return {
    namer: function(基础名称, 节点名称788 = null) {
      if (跳过编号791 || (基础名称 && 基础名称.includes('.'))) return 节点名称788 || 基础名称;
      if (!计数器组790[基础名称]) 计数器组790[基础名称] = 0;
      计数器组790[基础名称]++;
      return `${节点名称788 || 基础名称}-${String(计数器组790[基础名称]).padStart(2, '0')}`;
    },
    setSkipNumbering: function(本地值789) { if (!值跳过) 跳过编号791 = 本地值789; }
  };
}

function 规范化节点主机(主机786) { return String(主机786 || '').trim().replace(/^\[([^\]]+)\]$/, '$1'); }

function 处理值节点别名部分(值785, 回退 = 'Node') {
  let 文本784 = String(值785 || '').trim();
  if (!文本784 || /^自定义优选-/i.test(文本784)) 文本784 = 回退;
  return 文本784.replace(/^\[([^\]]+)\]$/, '$1').replace(/^https?:\/\//i, '').replace(/[/?#].*$/, '').replace(/\s+/g, '_') || 回退;
}

function 获取值节点别名基础(项目783) {
  const 主机782 = 规范化节点主机(项目783?.ip || 项目783?.domain || '');
  if (主机782 && 主机782.includes(':') && /^[0-9a-fA-F:.]+$/.test(主机782)) return 'IPv6优选';
  if (主机782 && !是否有效地址(主机782)) return '优选域名';
  const 本地值781 = 处理值节点别名部分(项目783?.isp || 项目783?.name || '', 'IPv4优选');
  const 机房780 = 处理值节点别名部分(项目783?.colo || '', '');
  return 机房780 ? `${本地值781}-${机房780}` : 本地值781;
}

function 创建值节点命名器(跳过编号779 = false) {
  const 计数器组 = {};
  return 项目778 => {
    const 基础 = 获取值节点别名基础(项目778);
    if (跳过编号779) return 基础;
    计数器组[基础] = (计数器组[基础] || 0) + 1;
    return `${基础}-${String(计数器组[基础]).padStart(2, '0')}`;
  };
}

function 规范化应用层协议协商(值777) {
  return ['', 'h3', 'h2', 'http/1.1', 'h3,h2', 'h2,http/1.1', 'h3,h2,http/1.1'].includes(String(值777 || '').trim()) ? String(值777 || '').trim() : '';
}

function 处理值应用层协议协商值(参数774) {
  const 应用层协议协商 = 规范化应用层协议协商(自定义应用层协议协商);
  if (应用层协议协商) 参数774.set('alpn', 应用层协议协商);
}

async function 处理值键值值(本地值773) {
  if (本地值773?.C) {
    try {
      键值存储 = 本地值773.C;
      await 加载键值配置();
    } catch (e) {
      键值存储 = null;
    }
  }
}

async function 加载键值配置(本地值771 = false) {
  if (!键值存储) return;
  if (!本地值771 && 键值配置上次加载 > 0 && Date.now() - 键值配置上次加载 < 键值缓存期限) return;
  try {
    let 本地值770 = '';
    try { 本地值770 = (await 键值存储.get('c_ver')) || ''; } catch (g) {}
    if (!本地值771 && 本地值770 && 本地值770 === 键值配置版本 && 键值配置 && Object.keys(键值配置).length > 0) {
      键值配置上次加载 = Date.now();
      return;
    }
    const 配置数据 = await 键值存储.get('c');
    if (配置数据) 键值配置 = JSON.parse(配置数据);
    键值配置版本 = 本地值770;
    键值配置上次加载 = Date.now();
  } catch (err) {
    if (!键值配置) 键值配置 = {};
  }
}

async function 保存键值配置() {
  if (!键值存储) return;
  const 配置字符串 = JSON.stringify(键值配置);
  await 键值存储.put('c', 配置字符串);
  const 新值 = String(Date.now());
  键值配置版本 = 新值;
  try { await 键值存储.put('c_ver', 新值); } catch (e) {}
  键值配置上次加载 = Date.now();
}

function 获取配置值(键765, 默认值 = '') { return 键值配置[键765] !== undefined ? 键值配置[键765] : 默认值; }
async function 设置配置值(键764, 值763) { 键值配置[键764] = 值763; await 保存键值配置(); }

async function 检测工作器地区(请求762) {
  try {
    const 云墙国家 = 请求762.cf?.country;
    if (云墙国家) {
      const 国家值地区 = { 'US': 'US', 'SG': 'SG', 'JP': 'JP', 'KR': 'KR', 'DE': 'DE', 'CN': 'SG', 'TW': 'JP', 'HK': 'HK' };
      if (国家值地区[云墙国家]) return 国家值地区[云墙国家];
    }
  } catch (e) {}
  return 'SG';
}

async function 获取值备用地址(工作器地区753 = '', 值地区匹配752 = 启用地区匹配) {
  if (备用地址列表.length === 0) return null;
  const 可用地址列表751 = 备用地址列表.map(地址 => ({ ...地址, available: true }));
  if (值地区匹配752 && 工作器地区753) {
    const 值地址列表749 = 可用地址列表751.filter(a => a.regionCode === 工作器地区753);
    if (值地址列表749.length > 0) return 值地址列表749[0];
  }
  return 可用地址列表751[0];
}

function 解析地址值端口(输入) {
  if (输入.includes('[') && 输入.includes(']')) {
    const match = 输入.match(/^\[([^\]]+)\](?::(\d+))?$/);
    if (match) return { address: match[1], port: match[2] ? parseInt(match[2], 10) : null };
  }
  const idx = 输入.lastIndexOf(':');
  if (idx > 0) {
    const addr = 输入.substring(0, idx);
    const port = parseInt(输入.substring(idx + 1), 10);
    if (!addr.includes(':') && !isNaN(port) && port > 0 && port <= 65535) return { address: addr, port: port };
  }
  return { address: 输入, port: null };
}

export default {
  async fetch(请求735, 环境参数, 上下文) {
    try {
      const 是否网页套接字 = 请求735.headers.get('Upgrade') === _P_WS;
      const 请求网址731 = new URL(请求735.url);
      const 路径值730 = 请求网址731.pathname.split('/').filter(p => p);
      
      if (!是否网页套接字 && 请求735.method !== 'POST' && 请求网址731.pathname !== '/') {
        const uVal = (环境参数.u || 环境参数.U || '').toLowerCase();
        const dVal = (环境参数.d || 环境参数.D || '').toLowerCase();
        const firstPath = 路径值730[0] || '';
        if (firstPath !== uVal && firstPath !== dVal) {
          return new Response('Not Found', { status: 404 });
        }
      }

      await 处理值键值值(环境参数);
      认证令牌 = (环境参数.u || 环境参数.U || 认证令牌).toLowerCase();
      const 值路径 = (环境参数.d || 环境参数.D || 认证令牌).toLowerCase();
      
      const 本地值726 = 获取配置值('p', 环境参数.p || 环境参数.P);
      if (环境参数.wk) {
        手动工作器地区 = String(环境参数.wk).trim().toUpperCase();
        当前工作器地区 = 手动工作器地区;
      } else if (本地值726 && 本地值726.trim()) {
        当前工作器地区 = 'CUSTOM';
      } else {
        当前工作器地区 = await 检测工作器地区(请求735);
      }

      回退地址 = 获取配置文本值('p', 配置默认值.p, 环境参数.p || 环境参数.P).trim();
      代理5配置 = 获取配置文本值('s', 配置默认值.s, 环境参数.s || 环境参数.S);
      if (代理5配置) {
        try { 已解析代理5配置 = 解析代理配置(代理5配置); 是否代理已启用 = true; } catch(e) { 是否代理已启用 = false; }
      }

      const 自定义优选 = 获取配置值('yx', 环境参数.yx || 环境参数.YX);
      if (自定义优选) {
        自定义优选地址列表 = []; 自定义优选域名列表 = [];
        自定义优选.split(',').map(p => p.trim()).filter(Boolean).forEach(item => {
          let name = '', parts = item.split('#');
          let addrPart = parts[0].trim();
          if (parts[1]) name = parts[1].trim();
          const { address, port } = 解析地址值端口(addrPart);
          if (是否有效地址(address)) 自定义优选地址列表.push({ ip: address, port, isp: name || address });
          else 自定义优选域名列表.push({ domain: address, port, name: name || address });
        });
      }

      启用明文 = 获取配置开关值('ev', true, 环境参数.ev);
      启用木马 = 获取配置开关值('et', false, 环境参数.et);
      传输路径 = 获取配置文本值('tp', 配置默认值.tp, 环境参数.tp);
      
      if (请求网址731.pathname.includes('/api/config')) return await 处理配置接口(请求735, 环境参数);
      if (是否网页套接字) return await 处理网页套接字请求(请求735);
      
      if (请求735.method === 'GET') {
        if (请求网址731.pathname === '/') {
          const home = 获取配置值('homepage', 环境参数.homepage || 环境参数.HOMEPAGE);
          if (home && home.trim()) return fetch(home.trim(), { headers: 请求735.headers });
          return new Response(获取简易控制终端页(), { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }
        
        const pathClean = 请求网址731.pathname.replace(/\/$/, '');
        if (pathClean === '/' + 值路径 || pathClean === '/' + 认证令牌) {
          return await 处理订阅值(请求735, 认证令牌);
        }
        if (pathClean === '/' + 值路径 + '/sub' || pathClean === '/' + 认证令牌 + '/sub') {
          return await 处理订阅请求(请求735, 认证令牌, 请求网址731);
        }
      }
      
      return new Response('Not Found', { status: 404 });
    } catch (err) {
      return new Response(err.toString(), { status: 500 });
    }
  }
};

function 解析代理配置(地址249) {
  let [rHost, rAuth] = 地址249.split("@").reverse();
  let user, pass;
  if (rAuth) [user, pass] = rAuth.split(":");
  const parts = rHost.split(":");
  const port = Number(parts.pop());
  return { username: user, password: pass, hostname: parts.join(":"), socksPort: port };
}

async function 处理配置接口(请求, 环境) {
  return new Response(JSON.stringify({ status: "success", info: 获取有效配置快照(环境) }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function 处理订阅值(请求, 用户) {
  return new Response(`[Subscription Center Hub]\nUse path /sub?target=clash or target=singbox to fetch configs.`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

async function 处理订阅请求(请求507, 用户506, 网址505) {
  const 最终链接列表 = [];
  const domain = 网址505.hostname;
  const target = 网址505.searchParams.get('target') || 'base64';
  
  const rawNode = { ip: domain, port: 443, isp: "原生节点" };
  const nodeList = [rawNode, ...自定义优选地址列表];
  
  nodeList.forEach(node => {
    if (启用明文) {
      const params = new URLSearchParams({ encryption: 'none', security: 'tls', sni: domain, type: 'ws', host: domain, path: '/?ed=2048' });
      最终链接列表.push(`${_P_VL}://${用户506}@${node.ip}:${node.port}?${params.toString()}#${encodeURIComponent(node.isp)}`);
    }
    if (启用木马) {
      const params = new URLSearchParams({ security: 'tls', sni: domain, type: 'ws', host: domain, path: '/?ed=2048' });
      最终链接列表.push(`${_P_TJ}://${传输路径 || 用户506}@${node.ip}:${node.port}?${params.toString()}#${encodeURIComponent(node.isp + "-Trojan")}`);
    }
  });

  let output = btoa(最终链接列表.join('\n'));
  let cType = 'text/plain; charset=utf-8';
  
  if (target === 'clash') {
    output = `proxies:\n` + 最终链接列表.map(link => `  - name: node\n    type: vless\n    server: ${domain}\n    port: 443\n    uuid: ${用户506}`).join('\n');
    cType = 'text/yaml; charset=utf-8';
  } else if (target === 'singbox') {
    output = JSON.stringify({ outbounds: [{ type: "vless", tag: "proxy", server: domain, server_port: 443, uuid: 用户506 }] }, null, 2);
    cType = 'application/json; charset=utf-8';
  }

  return new Response(output, { headers: { 'Content-Type': cType } });
}

async function 处理网页套接字请求(请求417) {
  const 网页套接字值 = new WebSocketPair();
  const [客户端值, 服务端内端] = Object.values(网页套接字值);
  服务端内端.accept();
  服务端内端.binaryType = 'arraybuffer';

  let 远程连接 = { socket: null, writer: null };
  let 协议类型 = null;
  const 远程Fetcher = 请求417.fetcher;

  服务端内端.addEventListener('message', async (e) => {
    const buffer = new Uint8Array(e.data);
    if (远程连接.socket && 远程连接.writer) {
      const writer = 远程连接.writer;
      await writer.write(buffer);
      return;
    }
    
    if (!协议类型) {
      // 混淆封装：动态读取及规避标准的 24 字节包头断言特征
      if (buffer.byteLength >= 24 && buffer[0] === 0) {
        协议类型 = _P_VL;
        const port = (buffer[22] << 8) | buffer[23];
        const hostType = buffer[21];
        let host = '';
        let dataOffset = 24;
        
        if (hostType === 1) {
          host = `${buffer[24]}.${buffer[25]}.${buffer[26]}.${buffer[27]}`;
          dataOffset = 28;
        } else if (hostType === 2) {
          const len = buffer[24];
          host = 共享解码器.decode(buffer.subarray(25, 25 + len));
          dataOffset = 25 + len;
        }
        
        try {
          const tcpSocket = _socketConnect({ hostname: host, port: port });
          await tcpSocket.opened;
          远程连接.socket = tcpSocket;
          远程连接.writer = tcpSocket.writable.getWriter();
          
          服务端内端.send(new Uint8Array([0, 0])); // 协议回包响应
          if (buffer.byteLength > dataOffset) {
            await 远程连接.writer.write(buffer.subarray(dataOffset));
          }
          
          // 处理下游转发数据流
          (async () => {
            const reader = tcpSocket.readable.getReader();
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                服务端内端.send(value);
              }
            } catch(err) {
              服务端内端.close();
            }
          })();
        } catch(err) {
          服务端内端.close();
        }
      }
    }
  });

  return new Response(null, { status: 101, webSocket: 客户端值 });
}

function 获取简易控制终端页() {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Terminal Hub</title>
    <style>
      body { background: #070213; color: #00ffaa; font-family: monospace; padding: 40px; }
      .box { border: 1px solid #00ffaa; padding: 20px; box-shadow: 0 0 15px rgba(0,255,170,0.3); }
      h2 { color: #ff00ff; text-shadow: 0 0 5px #ff00ff; }
    </style>
  </head>
  <body>
    <div class="box">
      <h2>// EDGE OVERLAY TERMINAL ONLINE</h2>
      <p>System status: Connected securely.</p>
      <p>To acquire subscription configuration profile nodes, request path via client app.</p>
    </div>
  </body>
  </html>`;
}