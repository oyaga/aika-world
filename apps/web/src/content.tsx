import type { ReactNode } from 'react'
import type { LandmarkPoi } from './world/layout'

export interface SectionContent {
  title: string
  body: ReactNode
}

export const GITHUB_USER = 'oyaga'

export const SECTIONS: Record<LandmarkPoi['id'], SectionContent> = {
  sobre: {
    title: 'Sobre',
    body: (
      <>
        <p>
          Olá! Este é um pequeno planeta onde a Aika mora. Cada casinha é um projeto, e os prédios
          maiores contam um pouco sobre quem está por trás deles.
        </p>
        <p>
          Texto provisório: aqui vai uma apresentação curta — quem sou, o que gosto de construir e
          por que este mundo existe.
        </p>
      </>
    ),
  },
  servicos: {
    title: 'Serviços',
    body: (
      <>
        <p>Texto provisório com os serviços oferecidos:</p>
        <ul>
          <li>Sites e aplicações web sob medida</li>
          <li>Experiências interativas e 3D na web</li>
          <li>Consultoria em front-end e performance</li>
        </ul>
      </>
    ),
  },
  contato: {
    title: 'Contato',
    body: (
      <>
        <p>A torre de rádio está captando sinais. Fale comigo por aqui:</p>
        <ul className="links">
          <li>
            <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer">
              GitHub — @{GITHUB_USER}
            </a>
          </li>
          <li>
            <a href="mailto:contato@example.com">E-mail (provisório)</a>
          </li>
        </ul>
      </>
    ),
  },
}
