import { Span } from '@chakra-ui/react'
import { GitBranch } from 'lucide-react'
import type React from 'react'
import { Badge } from 'src/shared/ui/kit'

interface IRepoPillProps {
  readonly repoName: string
}

export const RepoPill: React.FC<IRepoPillProps> = ({ repoName }: IRepoPillProps) => {
  const [, name] = repoName.split('/')

  return (
    <Badge tone="quiet" icon={<GitBranch size={11} />}>
      <Span className="mono">{name ?? repoName}</Span>
    </Badge>
  )
}
