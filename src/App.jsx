import { useState, useEffect, useRef } from "react";

import { Modal } from "bootstrap";
import axios from "axios";
import { getCookie, deleteCookie } from "./utility";
import "./App.css";
import ProductModal from "./components/ProductionModal";
import Pagination from "./components/Pagination";
import Login from "./views/Login";

export const API_PATH = import.meta.env.VITE_API_PATH;
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE });
export const COOKIE_NAME = import.meta.env.VITE_COOKIE_NAME;
const INITIAL_PRODUCT = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: "",
  imageUrl: "",
  imagesUrl: [],
  rating: "",
};

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(INITIAL_PRODUCT);
  const productModalRef = useRef(null);
  const [modelMode, setModalMode] = useState("");
  const [pagination, setPagination] = useState({});

  const getProducts = async (page = 1) => {
    try {
      const response = await api.get(
        `/api${API_PATH}/admin/products?page=${page}`,
      );
      setProducts(Object.values(response.data.products));
      setPagination(response.data.pagination);
    } catch (error) {
      alert("登入失敗: " + error.response.message);
    }
  };

  useEffect(() => {
    productModalRef.current = new Modal("#productModal", {
      keyboard: false,
      // backdrop: "static",
    });
    document
      .querySelector("#productModal")
      .addEventListener("hide.bs.modal", () => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
      });
    const token = getCookie(COOKIE_NAME);
    if (token === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuth(false);
    } else {
      api.defaults.headers.common["Authorization"] = token;
      const checkAuthentication = async () => {
        try {
          await api.post(`/api/user/check`);
          setIsAuth(true);
          getProducts();
        } catch (error) {
          deleteCookie(COOKIE_NAME); //該cookie已經失效
          setIsAuth(false);
          alert("無法正確驗證，請重新登入" + error.response.data.message);
        }
      };
      checkAuthentication();
    }
  }, []);
  const openModal = (product, mode) => {
    setModalMode(mode);
    productModalRef.current.show();
    setTempProduct(() => ({ ...INITIAL_PRODUCT, ...product }));
  };

  return (
    <>
      {isAuth ? (
        <div>
          <div className="container">
            <div className="text-end mt-4">
              <button
                className="btn btn-primary"
                onClick={() => openModal(INITIAL_PRODUCT, "create")}
              >
                建立新的產品
              </button>
            </div>
            <table className="table mt-4">
              <thead>
                <tr>
                  <th width="120">分類</th>
                  <th>產品名稱</th>
                  <th width="120">原價</th>
                  <th width="120">售價</th>
                  <th width="100">是否啟用</th>
                  <th width="120">編輯</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.category}</td>
                    <td>{product.title}</td>
                    <td className="text-end">{product.origin_price}</td>
                    <td className="text-end">{product.price}</td>
                    <td>
                      <span
                        className={
                          product.is_enabled ? "text-success" : "text-danger"
                        }
                      >
                        {product.is_enabled ? "啟用" : "未啟用"}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => openModal(product, "edit")}
                        >
                          編輯
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => openModal(product, "delete")}
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination pagination={pagination} onChangePage={getProducts} />
          </div>
        </div>
      ) : (
        <Login setIsAuth={setIsAuth} getProducts={getProducts} />
      )}
      <ProductModal
        productModalRef={productModalRef}
        modelMode={modelMode}
        tempProduct={tempProduct}
        setTempProduct={setTempProduct}
        getProducts={getProducts}
      />
    </>
  );
}

export default App;
