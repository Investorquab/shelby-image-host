'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  Upload, Image as ImgIcon, Link2, Copy, CheckCircle2,
  X, ExternalLink, Loader2, CloudUpload, LayoutGrid,
  Zap, Globe, ShieldCheck,
} from 'lucide-react'

interface ShelbyImage {
  blobId: string; fileName: string; mimeType: string
  sizeBytes: number; uploadedAt: number; expiresAt: number
  directUrl: string; viewUrl: string
}

type Status = 'idle' | 'preview' | 'uploading' | 'done' | 'error'

const fmtSize = (b: number) =>
  b < 1024 ? `${b}B` : b < 1048576 ? `${(b/1024).toFixed(1)}KB` : `${(b/1048576).toFixed(1)}MB`

const timeAgo = (ts: number) => {
  const d = Date.now()/1000 - ts
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d/60)}m ago`
  if (d < 86400) return `${Math.floor(d/3600)}h ago`
  return `${Math.floor(d/86400)}d ago`
}

export default function Home() {
  const [file,    setFile]    = useState<File|null>(null)
  const [preview, setPreview] = useState<string|null>(null)
  const [status,  setStatus]  = useState<Status>('idle')
  const [result,  setResult]  = useState<ShelbyImage|null>(null)
  const [errMsg,  setErrMsg]  = useState('')
  const [drag,    setDrag]    = useState(false)
  const [gallery, setGallery] = useState<ShelbyImage[]>([])
  const [loading, setLoading] = useState(false)
  const [tab,     setTab]     = useState<'upload'|'gallery'>('upload')
  const [copied,  setCopied]  = useState<string|null>(null)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { loadGallery() }, [])

  async function loadGallery() {
    setLoading(true)
    try {
      const r = await fetch('/api/images')
      const d = await r.json()
      if (d.success) setGallery(d.images)
    } finally { setLoading(false) }
  }

  const pick = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) { setErrMsg('Please select an image file'); setStatus('error'); return }
    if (f.size > 10*1024*1024) { setErrMsg('Max 10MB'); setStatus('error'); return }
    setFile(f); setStatus('preview'); setErrMsg(''); setResult(null)
    setPreview(URL.createObjectURL(f))
  }, [])

  async function upload() {
    if (!file) return
    setStatus('uploading')
    const fd = new FormData()
    fd.append('image', file)
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd })
      const d = await r.json()
      if (!d.success) throw new Error(d.error || 'Upload failed')
      setResult(d.image); setStatus('done'); loadGallery()
    } catch (e: any) { setErrMsg(e.message); setStatus('error') }
  }

  async function copy(text: string, key: string) {
    try { await navigator.clipboard.writeText(text) } catch {}
    setCopied(key); setTimeout(() => setCopied(null), 2000)
  }

  function reset() {
    setFile(null); setPreview(null); setStatus('idle'); setResult(null); setErrMsg('')
    if (ref.current) ref.current.value = ''
  }

  const S = {
    canvas:  '#0A0A0F', surface: '#111118', card: '#16161F',
    border:  '#252535', text:    '#E8E8F0', muted:  '#6B6B85',
    amber:   '#F5A623', amber2:  '#FF6B35', green:  '#4ADE80',
  }

  return (
    <div style={{ minHeight: '100vh', background: S.canvas, color: S.text, fontFamily: 'system-ui, sans-serif', position: 'relative' }}>

      {/* Ambient glow */}
      <div style={{ position:'fixed', top:-200, left:'50%', transform:'translateX(-50%)', width:700, height:400, background:'radial-gradient(ellipse, rgba(245,166,35,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

      {/* Header */}
      <header style={{ position:'relative', zIndex:10, borderBottom:`1px solid ${S.border}`, background:'rgba(17,17,24,0.9)', backdropFilter:'blur(12px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${S.amber},${S.amber2})`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#000', fontSize:14 }}>SV</div>
            <div>
              <span style={{ fontWeight:700, fontSize:18, letterSpacing:-0.5 }}>Shelby Vault</span>
              <span style={{ fontSize:12, color:S.muted, marginLeft:8 }}>Decentralized Image Host</span>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:20, background:S.card, border:`1px solid ${S.border}`, fontSize:12, color:S.muted }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:S.green, boxShadow:`0 0 6px ${S.green}`, display:'inline-block' }} />
            shelbynet · live
          </div>
        </div>
      </header>

      <main style={{ position:'relative', zIndex:10, maxWidth:1100, margin:'0 auto', padding:'48px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:56 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, padding:'6px 14px', borderRadius:20, background:S.card, border:`1px solid ${S.border}`, color:S.muted, marginBottom:24 }}>
            <span style={{ color:S.amber }}>⬡</span> Built on Shelby Protocol · Aptos Blockchain
          </div>
          <h1 style={{ fontSize:'clamp(36px,6vw,64px)', fontWeight:800, lineHeight:1.1, letterSpacing:-2, marginBottom:16 }}>
            Upload images.<br />
            <span style={{ background:`linear-gradient(90deg,${S.amber},${S.amber2})`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Own them on-chain.
            </span>
          </h1>
          <p style={{ fontSize:16, color:S.muted, maxWidth:520, margin:'0 auto 32px', lineHeight:1.7 }}>
            Store any image on Shelby&apos;s decentralized hot-storage. Get a permanent shareable link backed by the Aptos blockchain.
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:8 }}>
            {[[Zap,'Sub-second retrieval'],[Globe,'Globally distributed'],[ShieldCheck,'Blockchain-verified']].map(([Icon,label]: any) => (
              <span key={label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, padding:'6px 14px', borderRadius:20, background:S.card, border:`1px solid ${S.border}`, color:S.muted }}>
                <Icon size={11} color={S.amber} /> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, padding:4, borderRadius:12, width:'fit-content', background:S.card, border:`1px solid ${S.border}`, marginBottom:32 }}>
          {(['upload','gallery'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer', fontSize:14, fontWeight:500, display:'flex', alignItems:'center', gap:6, background: tab===t ? S.border : 'transparent', color: tab===t ? S.text : S.muted, transition:'all 0.2s' }}>
              {t === 'upload' ? <><CloudUpload size={13}/> Upload</> : <><LayoutGrid size={13}/> Gallery {gallery.length > 0 && <span style={{ fontSize:11, padding:'2px 6px', borderRadius:10, background:'rgba(245,166,35,0.15)', color:S.amber }}>{gallery.length}</span>}</>}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {tab === 'upload' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24 }}>

            {/* Drop zone */}
            <div>
              <div className={`drop-zone${drag?' over':''}`}
                style={{ borderRadius:16, padding:32, minHeight:280, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:S.card, cursor:'pointer', textAlign:'center' }}
                onDragOver={e=>{e.preventDefault();setDrag(true)}}
                onDragLeave={e=>{e.preventDefault();setDrag(false)}}
                onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)pick(f)}}
                onClick={()=>status!=='uploading'&&ref.current?.click()}>
                <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={e=>{const f=e.target.files?.[0];if(f)pick(f)}}/>
                {preview && file ? (
                  <div style={{ width:'100%' }}>
                    <div style={{ position:'relative', marginBottom:12 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="preview" style={{ width:'100%', borderRadius:12, maxHeight:200, objectFit:'contain' }}/>
                      {status!=='uploading' && (
                        <button onClick={e=>{e.stopPropagation();reset()}}
                          style={{ position:'absolute', top:8, right:8, width:28, height:28, borderRadius:'50%', border:'none', cursor:'pointer', background:'rgba(0,0,0,0.7)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <X size={13}/>
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize:13, color:S.muted }}><span style={{color:S.text}}>{file.name}</span> · {fmtSize(file.size)}</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ width:56, height:56, borderRadius:12, background:S.border, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><ImgIcon size={24} color={S.muted}/></div>
                    <p style={{ fontWeight:600, marginBottom:6 }}>Drop image here</p>
                    <p style={{ fontSize:13, color:S.muted }}>or click to browse · JPG PNG GIF WebP · max 10MB</p>
                  </div>
                )}
              </div>

              {status==='preview' && (
                <button onClick={upload} style={{ width:'100%', marginTop:12, padding:'14px', borderRadius:12, border:'none', cursor:'pointer', background:`linear-gradient(135deg,${S.amber},${S.amber2})`, color:'#000', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Upload size={15}/> Upload to Shelby Network
                </button>
              )}

              {status==='uploading' && (
                <div style={{ marginTop:12 }}>
                  <div style={{ padding:'14px', borderRadius:12, background:S.card, border:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontSize:14, color:S.muted }}>
                    <Loader2 size={15} color={S.amber} style={{animation:'spin 1s linear infinite'}}/> Signing Aptos transaction · Distributing to nodes...
                  </div>
                  <div style={{ height:2, borderRadius:1, background:S.border, marginTop:8, overflow:'hidden' }}>
                    <div className="progress-bar" style={{ height:'100%', borderRadius:1 }}/>
                  </div>
                </div>
              )}

              {status==='error' && (
                <div style={{ marginTop:12, padding:16, borderRadius:12, background:'rgba(255,80,80,0.08)', border:'1px solid rgba(255,80,80,0.25)' }}>
                  <p style={{ fontWeight:600, color:'#ff8080', marginBottom:4 }}>Upload failed</p>
                  <p style={{ fontSize:13, color:'#ff6060' }}>{errMsg}</p>
                  <button onClick={reset} style={{ fontSize:12, color:S.muted, background:'none', border:'none', cursor:'pointer', textDecoration:'underline', marginTop:4 }}>Try again</button>
                </div>
              )}
            </div>

            {/* Right panel */}
            <div>
              {status==='done' && result ? <SuccessCard img={result} copied={copied} onCopy={copy} S={S}/> : <HowItWorks S={S}/>}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {tab === 'gallery' && <Gallery images={gallery} loading={loading} copied={copied} onCopy={copy} S={S}/>}
      </main>

      {/* Footer */}
      <footer style={{ position:'relative', zIndex:10, borderTop:`1px solid ${S.border}`, marginTop:80, padding:'32px 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12, fontSize:13, color:S.muted }}>
          <span>Built on <a href="https://shelby.xyz" target="_blank" rel="noreferrer" style={{color:S.amber,textDecoration:'none'}}>Shelby Protocol</a> · <a href="https://aptos.dev" target="_blank" rel="noreferrer" style={{color:S.amber,textDecoration:'none'}}>Aptos</a></span>
          <div style={{ display:'flex', gap:20 }}>
            {[['Docs','https://docs.shelby.xyz'],['Explorer','https://explorer.shelby.xyz/shelbynet'],['Faucet','https://faucet.shelbynet.shelby.xyz']].map(([l,h]) => (
              <a key={l} href={h} target="_blank" rel="noreferrer" style={{color:S.muted,textDecoration:'none'}}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function SuccessCard({img,copied,onCopy,S}: {img:ShelbyImage,copied:string|null,onCopy:(t:string,k:string)=>void,S:any}) {
  return (
    <div className="fade-up" style={{ borderRadius:16, overflow:'hidden', background:S.card, border:`1px solid ${S.border}` }}>
      <div style={{ padding:'16px 20px', borderBottom:`1px solid ${S.border}`, display:'flex', alignItems:'center', gap:10 }}>
        <CheckCircle2 size={18} color={S.green}/>
        <div>
          <p style={{ fontWeight:600, fontSize:14 }}>Stored on Shelby Network</p>
          <p style={{ fontSize:12, color:S.muted }}>{img.fileName}</p>
        </div>
      </div>
      <div style={{ padding:16, background:S.surface }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.directUrl} alt={img.fileName} style={{ width:'100%', borderRadius:10, maxHeight:180, objectFit:'contain' }}/>
      </div>
      <div style={{ padding:20, display:'flex', flexDirection:'column', gap:12 }}>
        <CopyField label="Direct URL" value={img.directUrl} id={'url-'+img.blobId} copied={copied} onCopy={onCopy} S={S}/>
        <CopyField label="Blob ID" value={img.blobId} id={'id-'+img.blobId} copied={copied} onCopy={onCopy} S={S} mono/>
        <a href={img.viewUrl} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:12, padding:'10px', borderRadius:10, border:`1px solid ${S.border}`, color:S.muted, textDecoration:'none' }}>
          <ExternalLink size={12}/> View on Shelby Explorer
        </a>
        <p style={{ fontSize:12, color:S.muted }}>Expires {new Date(img.expiresAt*1000).toLocaleDateString()}</p>
      </div>
    </div>
  )
}

function CopyField({label,value,id,copied,onCopy,S,mono=false}: any) {
  const done = copied===id
  return (
    <div>
      <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1, color:S.muted, marginBottom:6 }}>{label}</p>
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:10, background:S.surface, border:`1px solid ${S.border}` }}>
        <Link2 size={11} color={S.muted} style={{flexShrink:0}}/>
        <span style={{ fontSize:12, fontFamily:mono?'monospace':'inherit', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</span>
        <button onClick={()=>onCopy(value,id)} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, padding:'4px 10px', borderRadius:6, border:'none', cursor:'pointer', background:done?'rgba(74,222,128,0.15)':S.border, color:done?S.green:S.text, flexShrink:0, transition:'all 0.2s' }}>
          {done ? <><CheckCircle2 size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
        </button>
      </div>
    </div>
  )
}

function HowItWorks({S}: {S:any}) {
  return (
    <div style={{ borderRadius:16, padding:24, background:S.card, border:`1px solid ${S.border}` }}>
      <p style={{ fontWeight:700, fontSize:15, marginBottom:20 }}>How it works</p>
      {[
        {n:'01',t:'Select image',d:'Drag & drop or click. JPG, PNG, GIF, WebP up to 10 MB.'},
        {n:'02',t:'Signed & stored',d:'Your Aptos wallet signs a transaction. Image is erasure-coded across storage nodes.'},
        {n:'03',t:'Get your link',d:'Blob ID and direct URL returned instantly. Anyone with the link can view it.'},
      ].map(({n,t,d}) => (
        <div key={n} style={{ display:'flex', gap:16, marginBottom:20 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:S.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontFamily:'monospace', color:S.muted, flexShrink:0 }}>{n}</div>
          <div><p style={{ fontWeight:600, fontSize:14, marginBottom:4 }}>{t}</p><p style={{ fontSize:13, color:S.muted, lineHeight:1.6 }}>{d}</p></div>
        </div>
      ))}
      <div style={{ borderRadius:10, padding:12, background:'rgba(245,166,35,0.06)', border:'1px solid rgba(245,166,35,0.15)' }}>
        <p style={{ fontWeight:600, fontSize:13, color:S.amber, marginBottom:4 }}>⚠ Developer Network</p>
        <p style={{ fontSize:12, color:S.muted }}>Running on shelbynet. Data resets ~weekly. Perfect for learning!</p>
      </div>
    </div>
  )
}

function Gallery({images,loading,copied,onCopy,S}: {images:ShelbyImage[],loading:boolean,copied:string|null,onCopy:(t:string,k:string)=>void,S:any}) {
  if (loading) return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
      {[...Array(8)].map((_,i) => <div key={i} className="shimmer" style={{ borderRadius:12, aspectRatio:'1', background:S.card }}/>)}
    </div>
  )
  if (!images.length) return (
    <div style={{ textAlign:'center', padding:'96px 0' }}>
      <div style={{ width:56, height:56, borderRadius:12, background:S.card, border:`1px solid ${S.border}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><ImgIcon size={24} color={S.border}/></div>
      <p style={{ fontWeight:600, marginBottom:8 }}>No images yet</p>
      <p style={{ fontSize:14, color:S.muted }}>Upload your first image to see it here</p>
    </div>
  )
  return (
    <>
      <p style={{ fontSize:14, color:S.muted, marginBottom:20 }}>{images.length} image{images.length!==1?'s':''} on Shelby</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
        {images.map((img,i) => <GalleryCard key={img.blobId} img={img} i={i} copied={copied} onCopy={onCopy} S={S}/>)}
      </div>
    </>
  )
}

function GalleryCard({img,i,copied,onCopy,S}: {img:ShelbyImage,i:number,copied:string|null,onCopy:(t:string,k:string)=>void,S:any}) {
  const [hover, setHover] = useState(false)
  const done = copied==='g-'+img.blobId
  const delays = ['d1','d2','d3','d4','d5','d6']
  return (
    <div className={`img-card fade-up ${delays[Math.min(i,5)]}`}
      style={{ borderRadius:12, overflow:'hidden', background:S.card, border:`1px solid ${S.border}`, opacity:0, animationFillMode:'forwards' }}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
      <div style={{ position:'relative', aspectRatio:'1', background:S.surface, overflow:'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.directUrl} alt={img.fileName} loading="lazy" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s', transform:hover?'scale(1.06)':'scale(1)' }}/>
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'flex-end', padding:10, gap:6, opacity:hover?1:0, transition:'opacity 0.25s' }}>
          <button onClick={()=>onCopy(img.directUrl,'g-'+img.blobId)}
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontSize:11, padding:'7px', borderRadius:8, border:'none', cursor:'pointer', background:done?'rgba(74,222,128,0.2)':'rgba(255,255,255,0.1)', color:'#fff' }}>
            {done?<><CheckCircle2 size={11}/>Copied</>:<><Copy size={11}/>Copy</>}
          </button>
          <a href={img.viewUrl} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
            style={{ display:'flex', alignItems:'center', padding:'7px 10px', borderRadius:8, background:'rgba(255,255,255,0.1)', color:'#fff', textDecoration:'none' }}>
            <ExternalLink size={11}/>
          </a>
        </div>
      </div>
      <div style={{ padding:'10px 12px' }}>
        <p style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }} title={img.fileName}>{img.fileName}</p>
        <p style={{ fontSize:11, color:S.muted }}>{timeAgo(img.uploadedAt)} · {fmtSize(img.sizeBytes)}</p>
      </div>
    </div>
  )
}
