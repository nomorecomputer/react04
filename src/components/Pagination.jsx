function Pagination({ pagination, onChangePage }) {
  const handleClick = (e, page) => {
    e.preventDefault();
    onChangePage(page);
  };
  return (
    <nav aria-label="Page navigation example">
      <ul className="pagination justify-content-center">
        <li
          className={`"page-item"   ${pagination.has_pre ? "" : "disabled"} `}
        >
          <a
            className="page-link"
            href="#"
            onClick={(e) => handleClick(e, pagination.current_page - 1)}
          >
            上頁
          </a>
        </li>
        {Array.from({ length: pagination.total_pages }, (v, i) => i + 1).map(
          (index) => (
            <li className="page-item" key={index}>
              <a
                className="page-link"
                disabled={pagination.current_page === index ? true : false}
                href="#"
                onClick={(e) => handleClick(e, index)}
              >
                {index}
              </a>
            </li>
          ),
        )}

        <li
          className={`"page-item"   ${pagination.has_next ? "" : "disabled"} `}
        >
          <a
            className="page-link"
            href="#"
            onClick={(e) => handleClick(e, pagination.current_page + 1)}
          >
            下頁
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
