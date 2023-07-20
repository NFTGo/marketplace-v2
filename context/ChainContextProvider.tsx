import { useRouter } from 'next/router'
import { useState, createContext, FC, useEffect, useCallback } from 'react'
import supportedChains, { DefaultChain } from 'utils/chains'

const supportedChainsMap = supportedChains.reduce((map, chain) => {
  map[chain.id] = chain
  return map
}, {} as Record<string, (typeof supportedChains)[0]>)

export const ChainContext = createContext<{
  chain: typeof DefaultChain
  switchCurrentChain: (chainId: string | number) => void
}>({
  chain: DefaultChain,
  switchCurrentChain: () => {},
})

const ChainContextProvider: FC<any> = ({ children }) => {
  const [globalChainId, setGlobalChainId] = useState(DefaultChain.id)
  const router = useRouter()

  useEffect(() => {
    const savedChainId: number = Number(
      localStorage.getItem('reservoir.chainId') || DefaultChain.id
    )
    let selectedChain: (typeof supportedChains)[0] | undefined

    if (router.query.chain) {
      selectedChain = supportedChains.find(
        (chain) => chain.routePrefix === router.query.chain
      )
    }
    if (!selectedChain) {
      selectedChain = supportedChains.find(
        (chain) => chain.id === +savedChainId
      )
    }
    const id = selectedChain?.id || DefaultChain.id
    setGlobalChainId(id)
    localStorage.setItem('reservoir.chainId', `${id}`)
  }, [])

  const switchCurrentChain = useCallback(
    (chainId: string | number) => {
      if (chainId === globalChainId) {
        return
      }

      setGlobalChainId(+chainId)

      if (typeof window !== 'undefined') {
        localStorage.setItem('reservoir.chainId', `${chainId}`)
      }
    },
    [globalChainId, setGlobalChainId]
  )

  let currentChain = DefaultChain
  if (globalChainId && supportedChainsMap[globalChainId]) {
    currentChain = supportedChainsMap[globalChainId]
  }

  return (
    <ChainContext.Provider value={{ chain: currentChain, switchCurrentChain }}>
      {children}
    </ChainContext.Provider>
  )
}

export default ChainContextProvider
