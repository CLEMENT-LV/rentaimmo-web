'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Bien = {
  id: number
  titre: string
  prix: number
  surface: number
  ville: string
  source: string
  url: string
  loyer_estime: number
  cashflow_mensuel: number
  rendement_brut: number
  rendement_realiste: number
  travaux_bas: number
  travaux_moyen: number
  travaux_haut: number
  travaux_description: string
  profit_realiste: number
  roi_realiste: number
  strategies_rentables: string
}

export default function Home() {
  const [biens, setBiens] = useState<Bien[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Bien | null>(null)
  const [filtre, setFiltre] = useState('tous')
  const [strategie, setStrategie] = useState('locatif')
  const [tri, setTri] = useState('rendement')

  useEffect(() => {
    const fetchBiens = async () => {
      const { data, error } = await supabase
        .from('biens')
        .select('*')
        .order('rendement_brut', { ascending: false })

      if (error) {
        console.error('Erreur Supabase :', error)
      }

      if (data) {
        setBiens(data)
        if (data.length > 0) setSelected(data[0])
      }

      setLoading(false)
    }

    fetchBiens()
  }, [])

  const biensFiltres = biens
    .filter((b) => {
      if (filtre === 'locatif') {
        return b.strategies_rentables?.includes('locatif')
      }
      if (filtre === 'revente') {
        return b.strategies_rentables?.includes('achat_revente')
      }
      if (filtre === '8+') {
        return b.rendement_brut >= 8
      }
      if (filtre === '10+') {
        return b.rendement_brut >= 10
      }
      return true
    })
    .sort((a, b) => {
      if (tri === 'rendement') return b.rendement_brut - a.rendement_brut
      if (tri === 'prix_asc') return a.prix - b.prix
      if (tri === 'prix_desc') return b.prix - a.prix
      if (tri === 'cashflow') return b.cashflow_mensuel - a.cashflow_mensuel
      return 0
    })

  const prixMoyen =
    biens.length > 0
      ? Math.round(biens.reduce((s, b) => s + b.prix, 0) / biens.length / 1000)
      : 0

  const meilleurRendement =
    biens.length > 0 ? Math.max(...biens.map((b) => b.rendement_brut)) : 0

  return (
    <main
      style={{
        fontFamily: 'sans-serif',
        background: '#f9fafb',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#10b981',
          }}
        />
        <span style={{ fontWeight: '600', fontSize: '18px' }}>RentaImmo</span>
        <span
          style={{
            marginLeft: 'auto',
            background: '#d1fae5',
            color: '#065f46',
            padding: '3px 10px',
            borderRadius: '20px',
            fontSize: '12px',
          }}
        >
          {biens.length} biens analyses
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          padding: '16px 24px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        {[
          { label: 'Biens rentables', value: biens.length.toString() },
          {
            label: 'Meilleur rendement',
            value: `${meilleurRendement.toFixed(1)}%`,
            color: '#10b981',
          },
          { label: 'Prix moyen', value: `${prixMoyen}k euro` },
          { label: 'Source', value: 'PAP' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: '#f9fafb',
              borderRadius: '8px',
              padding: '12px',
            }}
          >
            <div
              style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: '22px',
                fontWeight: '600',
                color: s.color || '#111827',
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 24px',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Filtrer :</span>

        {[
          { key: 'tous', label: 'Tous' },
          { key: 'locatif', label: 'Locatif' },
          { key: 'revente', label: 'Achat/Revente' },
          { key: '8+', label: '8%+' },
          { key: '10+', label: '10%+' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              border: 'none',
              background: filtre === f.key ? '#10b981' : '#f3f4f6',
              color: filtre === f.key ? 'white' : '#374151',
            }}
          >
            {f.label}
          </button>
        ))}

        <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
          Trier :
        </span>

        <select
          value={tri}
          onChange={(e) => setTri(e.target.value)}
          style={{
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            border: '1px solid #e5e7eb',
            background: 'white',
          }}
        >
          <option value="rendement">Rendement</option>
          <option value="prix_asc">Prix croissant</option>
          <option value="prix_desc">Prix decroissant</option>
          <option value="cashflow">Cashflow</option>
        </select>

        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af' }}>
          {biensFiltres.length} resultats
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          height: 'calc(100vh - 200px)',
        }}
      >
        <div
          style={{
            overflowY: 'auto',
            padding: '16px',
            borderRight: '1px solid #e5e7eb',
          }}
        >
          {loading && (
            <p style={{ textAlign: 'center', color: '#9ca3af' }}>Chargement...</p>
          )}

          {!loading && biensFiltres.length === 0 && (
            <p style={{ textAlign: 'center', color: '#9ca3af' }}>
              Aucun bien trouve
            </p>
          )}

          {biensFiltres.map((bien) => (
            <div
              key={bien.id}
              onClick={() => setSelected(bien)}
              style={{
                border:
                  selected?.id === bien.id
                    ? '2px solid #10b981'
                    : '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '10px',
                cursor: 'pointer',
                background: selected?.id === bien.id ? '#f0fdf4' : 'white',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    flex: 1,
                    paddingRight: '8px',
                  }}
                >
                  {bien.titre}
                </span>

                <span
                  style={{
                    background:
                      bien.rendement_brut >= 10
                        ? '#d1fae5'
                        : bien.rendement_brut >= 8
                          ? '#fef3c7'
                          : '#fee2e2',
                    color:
                      bien.rendement_brut >= 10
                        ? '#065f46'
                        : bien.rendement_brut >= 8
                          ? '#92400e'
                          : '#991b1b',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {bien.rendement_brut?.toFixed(1)}%
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                {bien.ville} | {bien.surface}m2 | {bien.loyer_estime}euro/mois
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '600', fontSize: '15px' }}>
                  {(bien.prix / 1000).toFixed(0)}k euro
                </span>
                <span
                  style={{
                    background: '#f3f4f6',
                    padding: '2px 8px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: '#6b7280',
                  }}
                >
                  {bien.source}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ overflowY: 'auto', padding: '16px' }}>
          {!selected ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '60px' }}>
              Selectionnez un bien pour voir le detail
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
                {selected.titre}
              </h2>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['locatif', 'revente'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrategie(s)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      border: 'none',
                      background: strategie === s ? '#10b981' : '#f3f4f6',
                      color: strategie === s ? 'white' : '#374151',
                    }}
                  >
                    {s === 'locatif' ? 'Locatif' : 'Achat/Revente'}
                  </button>
                ))}
              </div>

              {strategie === 'locatif' ? (
                <div>
                  <div
                    style={{
                      background: '#f0fdf4',
                      borderRadius: '10px',
                      padding: '16px',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#065f46' }}>
                      Rendement brut
                    </div>
                    <div
                      style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#065f46',
                      }}
                    >
                      {selected.rendement_brut?.toFixed(1)}%
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        marginTop: '4px',
                      }}
                    >
                      Loyer estime : {selected.loyer_estime} euro/mois | Cashflow :{' '}
                      {selected.cashflow_mensuel} euro/mois
                    </div>
                  </div>

                  <table
                    style={{
                      width: '100%',
                      fontSize: '13px',
                      borderCollapse: 'collapse',
                      background: 'white',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <tbody>
                      {[
                        ['Prix', `${selected.prix?.toLocaleString('fr-FR')} euro`],
                        ['Surface', `${selected.surface} m2`],
                        ['Ville', selected.ville],
                        ['Loyer estime', `${selected.loyer_estime} euro/mois`],
                        [
                          'Cashflow mensuel',
                          `${selected.cashflow_mensuel} euro/mois`,
                        ],
                      ].map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                            {k}
                          </td>
                          <td
                            style={{
                              padding: '10px 12px',
                              fontWeight: '500',
                              textAlign: 'right',
                            }}
                          >
                            {v}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div
                    style={{
                      background: '#fffbeb',
                      borderRadius: '10px',
                      padding: '14px',
                      marginTop: '12px',
                      border: '1px solid #fde68a',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#92400e',
                        marginBottom: '8px',
                      }}
                    >
                      Travaux estimes
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '8px',
                        textAlign: 'center',
                        marginBottom: '8px',
                      }}
                    >
                      {[
                        ['Bas', selected.travaux_bas],
                        ['Moyen', selected.travaux_moyen],
                        ['Haut', selected.travaux_haut],
                      ].map(([label, val]) => (
                        <div key={label as string}>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>
                            {label as string}
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>
                            {((val as number) / 1000).toFixed(0)}k euro
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: '12px', color: '#92400e' }}>
                      {selected.travaux_description}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      background: '#eff6ff',
                      borderRadius: '10px',
                      padding: '16px',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#1d4ed8' }}>
                      ROI realiste
                    </div>
                    <div
                      style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#1d4ed8',
                      }}
                    >
                      {selected.roi_realiste?.toFixed(1)}%
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        marginTop: '4px',
                      }}
                    >
                      Profit estime :{' '}
                      {selected.profit_realiste?.toLocaleString('fr-FR')} euro
                    </div>
                  </div>

                  <table
                    style={{
                      width: '100%',
                      fontSize: '13px',
                      borderCollapse: 'collapse',
                      background: 'white',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <tbody>
                      {[
                        ['Prix achat', `${selected.prix?.toLocaleString('fr-FR')} euro`],
                        [
                          'Travaux moyen',
                          `${selected.travaux_moyen?.toLocaleString('fr-FR')} euro`,
                        ],
                        [
                          'Profit realiste',
                          `${selected.profit_realiste?.toLocaleString('fr-FR')} euro`,
                        ],
                        ['ROI', `${selected.roi_realiste?.toFixed(1)}%`],
                      ].map(([k, v]) => (
                        <tr key={k} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                            {k}
                          </td>
                          <td
                            style={{
                              padding: '10px 12px',
                              fontWeight: '500',
                              textAlign: 'right',
                            }}
                          >
                            {v}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#10b981',
                  color: 'white',
                  padding: '12px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  marginTop: '16px',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                Voir annonce originale
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}