import React from 'react';
import { Helmet } from 'react-helmet-async';

interface Review {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
  title?: string;
}

interface ReviewSchemaProps {
  itemName: string;
  itemType?: 'Game' | 'SoftwareApplication' | 'Service' | 'Organization';
  reviews: Review[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  itemDescription?: string;
  itemImage?: string;
  itemUrl?: string;
}

/**
 * 评价和评论结构化数据组件
 *
 * 功能特性：
 * - 生成Review和AggregateRating Schema.org标记
 * - 支持多种项目类型（游戏、软件、服务等）
 * - 自动计算聚合评分
 * - SEO优化的评价显示
 */
export const ReviewSchema: React.FC<ReviewSchemaProps> = ({
  itemName,
  itemType = 'Game',
  reviews,
  aggregateRating,
  itemDescription,
  itemImage,
  itemUrl = window.location.href,
}) => {
  // 自动计算聚合评分（如果没有提供）
  const calculateAggregateRating = () => {
    if (aggregateRating) return aggregateRating;

    if (reviews.length === 0) return null;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    return {
      ratingValue: Math.round(averageRating * 10) / 10, // 保留一位小数
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
  };

  const finalAggregateRating = calculateAggregateRating();

  // 生成项目基本信息Schema
  const generateItemSchema = () => {
    const baseSchema: any = {
      '@context': 'https://schema.org',
      '@type': itemType,
      name: itemName,
      url: itemUrl,
      ...(itemDescription && { description: itemDescription }),
      ...(itemImage && { image: itemImage }),
    };

    // 添加聚合评分
    if (finalAggregateRating) {
      baseSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: finalAggregateRating.ratingValue,
        reviewCount: finalAggregateRating.reviewCount,
        bestRating: finalAggregateRating.bestRating || 5,
        worstRating: finalAggregateRating.worstRating || 1,
      };
    }

    // 添加评论
    if (reviews.length > 0) {
      baseSchema.review = reviews.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author,
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: review.reviewBody,
        datePublished: review.datePublished,
        ...(review.title && { name: review.title }),
      }));
    }

    return baseSchema;
  };

  // 为Minecraft服务器特化的Schema
  const generateMinecraftServerSchema = () => {
    if (itemType !== 'Game') return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: itemName,
      gameServer: {
        '@type': 'GameServer',
        name: itemName,
        url: itemUrl,
        game: {
          '@type': 'VideoGame',
          name: 'Minecraft',
          genre: ['沙盒游戏', '建造游戏', '多人在线游戏'],
          platform: 'Minecraft Java Edition',
        },
        serverStatus: 'active',
        playMode: 'MultiPlayer',
        ...(itemDescription && { description: itemDescription }),
        ...(finalAggregateRating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: finalAggregateRating.ratingValue,
            reviewCount: finalAggregateRating.reviewCount,
            bestRating: finalAggregateRating.bestRating || 5,
            worstRating: finalAggregateRating.worstRating || 1,
          },
        }),
      },
    };
  };

  const itemSchema = generateItemSchema();
  const minecraftSchema = generateMinecraftServerSchema();

  // 星级评分显示组件
  const StarRating: React.FC<{ rating: number; maxRating?: number }> = ({
    rating,
    maxRating = 5,
  }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < maxRating; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ★
          </span>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-400">
            ☆
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">
            ☆
          </span>
        );
      }
    }

    return <span className="flex items-center">{stars}</span>;
  };

  return (
    <>
      {/* 结构化数据 */}
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(itemSchema, null, 2)}</script>
        {minecraftSchema && (
          <script type="application/ld+json">{JSON.stringify(minecraftSchema, null, 2)}</script>
        )}
      </Helmet>

      {/* 评价概览 - 可选的UI显示 */}
      {finalAggregateRating && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">用户评价</h3>
              <div className="flex items-center mt-1">
                <StarRating rating={finalAggregateRating.ratingValue} />
                <span className="ml-2 text-sm text-gray-600">
                  {finalAggregateRating.ratingValue} 分 (基于 {finalAggregateRating.reviewCount}{' '}
                  条评价)
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {finalAggregateRating.ratingValue}
              </div>
              <div className="text-sm text-gray-500">/ {finalAggregateRating.bestRating}</div>
            </div>
          </div>
        </div>
      )}

      {/* 评论列表 - 可选的UI显示 */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">玩家评价</h4>
          {reviews.slice(0, 3).map(
            (
              review,
              index // 只显示前3条
            ) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{review.author}</span>
                  <div className="flex items-center">
                    <StarRating rating={review.rating} />
                    <span className="ml-2 text-sm text-gray-500">
                      {new Date(review.datePublished).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
                {review.title && <h5 className="font-medium text-gray-800 mb-1">{review.title}</h5>}
                <p className="text-gray-700 text-sm">{review.reviewBody}</p>
              </div>
            )
          )}

          {reviews.length > 3 && (
            <div className="text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                查看更多评价 ({reviews.length - 3} 条)
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

/**
 * Minecraft服务器评价组件 - 预配置的游戏服务器评价
 */
export const MinecraftServerReview: React.FC<{
  serverName: string;
  reviews: Review[];
  description?: string;
  logoUrl?: string;
}> = ({ serverName, reviews, description, logoUrl }) => {
  return (
    <ReviewSchema
      itemName={serverName}
      itemType="Game"
      reviews={reviews}
      itemDescription={description || `${serverName} - 专业的Minecraft多人游戏服务器`}
      itemImage={logoUrl}
    />
  );
};

export default ReviewSchema;
