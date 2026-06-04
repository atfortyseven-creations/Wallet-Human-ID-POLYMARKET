import { 
  PrismaClient as OriginalPrismaClient,
  Prisma
} from '@prisma/client'

/**
 *  WHALE ALERT NETWORK  PRISMA TYPE AUGMENTATION
 * This file formally extends the Prisma namespace to include the NewsArticle model.
 * This is the expert-grade solution for handling schema drift before client regeneration.
 */

declare module '@prisma/client' {
  // 1. Augment the Prisma namespace for model types
  namespace Prisma {
    export type NewsArticleCreateInput = {
      id?: string
      externalId?: string | null
      title: string
      summary: string
      url: string
      source: string
      imageUrl?: string | null
      category?: string
      publishedAt?: string | Date
      veracityScore?: number
      veracityAnalysis?: string | null
      isFake?: boolean
      sentiment?: string
      tokens?: string[] | NewsArticleCreatetokensInput
      createdAt?: string | Date
      updatedAt?: string | Date
    }

    export type NewsArticleUpdateInput = Partial<NewsArticleCreateInput>

    export type NewsArticleCreatetokensInput = {
      set: string[]
    }

    export type Enumerable<T> = T | Array<T>

    export type NewsArticleWhereInput = {
      id?: string | StringFilter
      externalId?: string | StringNullableFilter | null
      url?: string | StringFilter
      title?: string | StringFilter
      source?: string | StringFilter
      publishedAt?: DateTimeFilter | Date | string
      
      // Logical connectors
      OR?: Enumerable<NewsArticleWhereInput>
      AND?: Enumerable<NewsArticleWhereInput>
      NOT?: Enumerable<NewsArticleWhereInput>
    }

    export type NewsArticleWhereUniqueInput = {
      id?: string
      externalId?: string
      url?: string
    }

    export interface NewsArticleDelegate<T extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined> {
      findFirst<T extends NewsArticleFindFirstArgs>(args?: SelectSubset<T, NewsArticleFindFirstArgs>): Prisma__NewsArticleClient<NewsArticle | null>
      findMany<T extends NewsArticleFindManyArgs>(args?: SelectSubset<T, NewsArticleFindManyArgs>): PrismaPromise<Array<NewsArticle>>
      create<T extends NewsArticleCreateArgs>(args: SelectSubset<T, NewsArticleCreateArgs>): Prisma__NewsArticleClient<NewsArticle>
      upsert<T extends NewsArticleUpsertArgs>(args: SelectSubset<T, NewsArticleUpsertArgs>): Prisma__NewsArticleClient<NewsArticle>
      // ... Add delete, update, etc if used
    }

    export type NewsArticleFindFirstArgs = {
      select?: NewsArticleSelect | null
      where?: NewsArticleWhereInput
      orderBy?: Enumerable<NewsArticleOrderByWithRelationInput>
      cursor?: NewsArticleWhereUniqueInput
      take?: number
      skip?: number
      distinct?: Enumerable<NewsArticleScalarFieldEnum>
    }

    export type NewsArticleFindManyArgs = NewsArticleFindFirstArgs

    export type NewsArticleCreateArgs = {
      select?: NewsArticleSelect | null
      data: NewsArticleCreateInput
    }

    export type NewsArticleUpsertArgs = {
      select?: NewsArticleSelect | null
      where: NewsArticleWhereUniqueInput
      update: NewsArticleUpdateInput
      create: NewsArticleCreateInput
    }

    export type NewsArticleSelect = {
      id?: boolean
      title?: boolean
      summary?: boolean
      url?: boolean
      source?: boolean
      publishedAt?: boolean
      // ...
    }
  }

  // 2. Extend the PrismaClient interface
  interface PrismaClient {
    newsArticle: Prisma.NewsArticleDelegate<undefined>
  }
}

// Export something to make it a module
export {}
