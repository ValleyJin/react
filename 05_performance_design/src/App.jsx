import { useState, useMemo, useCallback, memo } from 'react'
import './index.css'

// 상품 카테고리
const CATEGORIES = ['전체', '전자기기', '의류', '식품', '도서', '스포츠']

// 상품 데이터 생성 (100개) — 앱 시작 시 한 번만 생성
const PRODUCTS = Array.from({ length: 100 }, (_, i) => {
  const categories = ['전자기기', '의류', '식품', '도서', '스포츠']
  const category = categories[i % categories.length]
  const names = {
    전자기기: ['무선 이어폰', '스마트워치', '태블릿', '키보드', '웹캠'],
    의류:    ['후드티', '청바지', '운동화', '패딩', '니트'],
    식품:    ['그래놀라', '아몬드', '녹차', '단백질바', '오트밀'],
    도서:    ['리액트 입문', 'TypeScript 심화', 'UX 디자인', '알고리즘', '클린코드'],
    스포츠:  ['요가매트', '덤벨', '줄넘기', '물통', '운동장갑'],
  }
  return {
    id: i + 1,
    name: `${names[category][i % 5]} ${Math.floor(i / 5) + 1}호`,
    category,
    price: (Math.floor(Math.random() * 90) + 10) * 1000,
    rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
    inStock: Math.random() > 0.2,
  }
})

// --- ProductCard: memo로 감싸 불필요한 리렌더링을 방지 ---
// 부모(App)의 state가 바뀌어도 이 카드의 props가 그대로면 리렌더링을 스킵한다
const ProductCard = memo(function ProductCard({ product, isLiked, onToggleLike }) {
  return (
    <div className={`card ${!product.inStock ? 'out-of-stock' : ''}`}>
      <div className="card-category">{product.category}</div>
      <div className="card-name">{product.name}</div>
      <div className="card-rating">
        {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
        <span className="rating-number">{product.rating}</span>
      </div>
      <div className="card-bottom">
        <span className="card-price">{product.price.toLocaleString()}원</span>
        <div className="card-actions">
          {!product.inStock && <span className="out-badge">품절</span>}
          <button
            className={`like-btn ${isLiked ? 'liked' : ''}`}
            onClick={() => onToggleLike(product.id)}
          >
            {isLiked ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  )
})

// --- 메인 앱 ---
export default function App() {
  const [query, setQuery]       = useState('')
  const [category, setCategory] = useState('전체')
  const [sortBy, setSortBy]     = useState('default')
  const [likedIds, setLikedIds] = useState(new Set())

  // useMemo: query, category, sortBy가 바뀔 때만 필터링/정렬을 재실행한다
  // 이 계산을 매 렌더링마다 100개 상품에 반복하면 느려질 수 있다
  const filtered = useMemo(() => {
    let result = PRODUCTS

    if (category !== '전체') {
      result = result.filter((p) => p.category === category)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (sortBy === 'price-asc')  result = [...result].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price)
    if (sortBy === 'rating')     result = [...result].sort((a, b) => b.rating - a.rating)

    return result
  }, [query, category, sortBy])

  // useCallback: memo(ProductCard)에 함수를 props로 내릴 때 참조를 안정화한다
  // 이게 없으면 매 렌더링마다 새 함수가 생성돼 memo의 효과가 사라진다
  const handleToggleLike = useCallback((id) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  return (
    <div className="app">
      <div className="container">
        {/* 헤더 */}
        <div className="header">
          <h1 className="title">상품 목록</h1>
          <p className="subtitle">
            {filtered.length}개 상품 · 찜 {likedIds.size}개
          </p>
        </div>

        {/* 검색 + 정렬 */}
        <div className="toolbar">
          <input
            className="search-input"
            type="text"
            placeholder="상품명 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">기본순</option>
            <option value="price-asc">가격 낮은순</option>
            <option value="price-desc">가격 높은순</option>
            <option value="rating">평점순</option>
          </select>
        </div>

        {/* 카테고리 필터 */}
        <div className="category-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 상품 목록 */}
        {filtered.length === 0 ? (
          <p className="empty">검색 결과가 없습니다.</p>
        ) : (
          <div className="grid">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isLiked={likedIds.has(product.id)}
                onToggleLike={handleToggleLike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
