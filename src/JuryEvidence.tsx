import { ArrowRight, ClipboardList, Database, Diamond, Flame, Gauge, Network, Waves } from 'lucide-react'
import { JuryCard } from './JuryCard'

export function BuildingCase() {
  return <section className="section fixed-screen static-beat building-case" id="bina-sorunu" aria-labelledby="building-case-title">
    <div className="beat-pin"><div className="shell story-panel">
      <p className="eyebrow">Problem · Konut siteleri · Pompa dairesi</p>
      <h2 id="building-case-title">Üç ayrı alarm, bir bina.</h2>
      <div className="building-cards">
        <div className="building-systems">
          <JuryCard title="Hidrofor" icon={<Gauge size={20} />}>
            <p>Yoğun kullanımda üst katların su basıncı düşebilir.</p>
          </JuryCard>
          <JuryCard title="Yangın" icon={<Flame size={20} />}>
            <p>Test kaydı veya jokey pompasının sık çalışması gözden kaçabilir.</p>
          </JuryCard>
          <JuryCard title="Atık su ve drenaj" icon={<Waves size={20} />}>
            <p>Tıkanma ve şamandıra arızası sağanakta taşkına dönüşebilir.</p>
            <a className="scene-source" href="https://wilo.com/tr/tr/Hizmetlerimiz/Segmentler-i%C3%A7in-%C3%A7%C3%B6z%C3%BCmler/Su-y%C3%B6netimi-%C3%A7%C3%B6z%C3%BCmleri/Ta%C5%9Fk%C4%B1n-Y%C3%B6netimi/">Wilo taşkın yönetimi</a>
          </JuryCard>
        </div>
        <div className="building-operations">
          <JuryCard title="Mevcut yaklaşım ve eksikliği" icon={<ClipboardList size={20} />}>
            <p>Ekip eşik alarmlarına, ayrı kontrolör ekranlarına ve periyodik bakıma dayanır. Hangi sistemin öncelikli olduğunu elle değerlendirir.</p>
            <p><strong>Sahada soracağız.</strong> Arızayı ilk kim, hangi işaretten fark ediyor?</p>
          </JuryCard>
          <JuryCard title="Ortak kaynaklar" icon={<Network size={20} />}>
            <p>Ortak depo veya jeneratör olan binalarda bir sistemin kararı diğerini etkileyebilir. Kaynak çakışmalarını bina ekibi yönetir.</p>
          </JuryCard>
        </div>
      </div>
    </div></div>
  </section>
}

export function DecisionLogic() {
  return <section className="section fixed-screen static-beat decision-logic" id="yapay-zeka" aria-labelledby="decision-logic-title">
    <div className="beat-pin"><div className="shell story-panel">
      <p className="eyebrow">Yapay zekânın rolü · Sağanak örneği</p>
      <h2 id="decision-logic-title">Her katmanın ayrı bir işi var.</h2>
      <div className="jury-grid decision-visuals">
        <JuryCard title="Pompa ajanı · Erken uyarı">
          <p>Model binanın normalini öğrenir. Sabit eşiğe göre, sıklaşan jokey çalışması veya değişen kuyu dolma hızı gibi erken sapmaları arar.</p>
          <div className="decision-demo detection-demo" aria-hidden="true">
            <div className="decision-bars">
              {[36, 50, 63, 78].map((level) => <span key={level} style={{ height: level + '%' }} />)}
            </div>
            <div className="decision-demo-label"><span>Olağan %35–50</span><strong>%78</strong></div>
          </div>
        </JuryCard>
        <JuryCard title="Dijital ikiz · Öneriyi dene">
          <p>Sanal bina, talep ve yağış değiştiğinde basınç desteğini veya tahliyeyi dener. Etkiyi ölçümle gösterir.</p>
          <div className="decision-demo twin-demo" aria-hidden="true">
            <div className="decision-tanks">
              <div className="decision-tank"><span /></div>
              <ArrowRight size={17} />
              <div className="decision-tank"><span /></div>
            </div>
            <div className="decision-demo-label"><span>%78</span><strong>%61</strong></div>
          </div>
        </JuryCard>
        <JuryCard title="Şef ajan · Ortak karar">
          <p>Ajan bulgularını birleştirir. Ortak depo veya jeneratör çakışmasında, yangın önceliği ve rezerv sınırına göre görev önerir.</p>
          <div className="decision-demo assignment-demo" aria-hidden="true">
            <div className="decision-route">
              <span className="decision-node"><Diamond size={17} /></span>
              <span className="decision-signal"><i /></span>
              <span className="decision-node"><Waves size={17} /></span>
            </div>
            <div className="decision-demo-label"><span>Şef</span><strong>Atık su ajanı</strong></div>
          </div>
        </JuryCard>
        <JuryCard title="LLM · Açıklama ve soru-cevap">
          <p>MCP ile yetkili kayıtları ve kılavuzları okur, sonucu role göre açıklar. Cihaz komutları yetkisinin dışındadır.</p>
          <div className="decision-demo explanation-demo" aria-hidden="true">
            <span className="decision-data"><Database size={13} /> Bina kaydı</span>
            <div className="decision-message"><strong>Yöneticiye</strong> Kuyu seviyesi %61’e indi.</div>
          </div>
        </JuryCard>
      </div>
    </div></div>
  </section>
}
