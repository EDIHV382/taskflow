import { motion } from 'framer-motion'

interface SkeletonCardProps {
  viewMode?: 'grid' | 'list'
}

export const SkeletonCard = ({ viewMode = 'grid' }: SkeletonCardProps) => {
  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
        viewMode === 'list' ? 'flex gap-4 p-4' : 'p-4'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Title skeleton */}
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-shimmer" />
          <div className="flex gap-1">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
          </div>
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-shimmer" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-shimmer" />
        </div>

        {/* Badges skeleton */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-shimmer" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-shimmer" />
        </div>

        {/* Date skeleton */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-shimmer" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-shimmer" />
        </div>
      </div>
    </motion.div>
  )
}

export const SkeletonCardGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonCard key={i} viewMode="grid" />
      ))}
    </div>
  )
}

export const SkeletonCardList = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <SkeletonCard key={i} viewMode="list" />
      ))}
    </div>
  )
}
