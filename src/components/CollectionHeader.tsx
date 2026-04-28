import { Link } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

type CollectionHeaderLink = {
  name: string;
  path?: string;
};

type CollectionTab = {
  label: string;
  path: string;
};

type SortOption = {
  label: string;
  value: string;
};

type CollectionHeaderProps = {
  breadcrumbItems: CollectionHeaderLink[];
  title: string;
  description?: string;
  tabs?: CollectionTab[];
  activeTab?: string;
  productCount: number;
  visibleCount?: number;
  onFilterClick?: () => void;
  filterLabel?: string;
  sortValue?: string;
  sortOptions?: SortOption[];
  onSortChange?: (value: string) => void;
};

export default function CollectionHeader({
  breadcrumbItems,
  title,
  description,
  tabs = [],
  activeTab,
  productCount,
  visibleCount,
  onFilterClick,
  filterLabel = 'Filter',
  sortValue,
  sortOptions = [],
  onSortChange,
}: CollectionHeaderProps) {
  const shownCount = visibleCount ?? productCount;
  const productLabel = productCount === 1 ? 'Product' : 'Products';
  const countText =
    shownCount > 0 && shownCount !== productCount
      ? `Showing 1-${shownCount} of ${productCount} ${productLabel}`
      : `Showing ${productCount} ${productLabel}`;

  return (
    <section className="bg-[#FBF7EF] border-b border-[#E6D8C4]">
      <div className="mx-auto max-w-[1340px] px-5 py-9 text-center md:px-12 md:py-12">
        <nav
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F6257]"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="transition-colors hover:text-[#5C1B24]">
            Home
          </Link>
          {breadcrumbItems.map((item) => (
            <span key={`${item.name}-${item.path ?? 'current'}`} className="inline-flex items-center gap-2">
              <span className="text-[#B9904A]/70">/</span>
              {item.path ? (
                <Link to={item.path} className="transition-colors hover:text-[#5C1B24]">
                  {item.name}
                </Link>
              ) : (
                <span className="text-[#1A120F]">{item.name}</span>
              )}
            </span>
          ))}
        </nav>

        <div className="mx-auto mt-5 max-w-[900px]">
          <h1 className="font-heading text-[2.3rem] leading-none tracking-[0.04em] text-[#1A120F] md:text-[3.25rem]">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-[#6F6257] md:text-[15px]">
              {description}
            </p>
          )}
        </div>

        {tabs.length > 0 && (
          <nav
            className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-[#E6D8C4] pt-5 md:gap-x-9"
            aria-label={`${title} categories`}
          >
            {tabs.map((tab) => {
              const active = activeTab === tab.label;
              return (
                <Link
                  key={`${tab.label}-${tab.path}`}
                  to={tab.path}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors md:text-[12px] ${
                    active ? 'text-[#5C1B24]' : 'text-[#1A120F] hover:text-[#5C1B24]'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`absolute inset-x-0 bottom-0 h-px bg-[#B9904A] transition-opacity ${
                      active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <div className="border-t border-[#E6D8C4] bg-[#FFFDF8]">
        <div className="mx-auto grid max-w-[1340px] grid-cols-2 items-center gap-y-3 px-5 py-3 md:grid-cols-3 md:px-12">
          <button
            type="button"
            onClick={onFilterClick}
            className="inline-flex items-center gap-2 justify-self-start text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1A120F] transition-colors hover:text-[#5C1B24]"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
            {filterLabel}
          </button>

          <p className="col-span-2 row-start-2 justify-self-center text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6F6257] md:col-span-1 md:col-start-2 md:row-start-auto md:text-[11px]">
            {countText}
          </p>

          <div className="relative justify-self-end">
            {sortOptions.length > 0 && sortValue && onSortChange ? (
              <>
                <label htmlFor={`sort-${title.replace(/\s+/g, '-').toLowerCase()}`} className="sr-only">
                  Sort by
                </label>
                <select
                  id={`sort-${title.replace(/\s+/g, '-').toLowerCase()}`}
                  value={sortValue}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="appearance-none bg-transparent py-2 pl-3 pr-8 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1A120F] focus:outline-none focus:text-[#5C1B24]"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort By: {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6F6257]" />
              </>
            ) : (
              <button
                type="button"
                className="inline-flex items-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1A120F]"
              >
                Sort By
                <ChevronDown className="h-3.5 w-3.5 text-[#6F6257]" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
