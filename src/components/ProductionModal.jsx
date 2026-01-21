import { useEffect, useState } from "react";
import { api, API_PATH } from "../App";
function ProductModal({
  productModalRef,
  modelMode,
  tempProduct,
  getProducts,
}) {
  const [tmpData, setTmpData] = useState(tempProduct);
  useEffect(() => {
    setTmpData(tempProduct);
  }, [tempProduct]);
  console.dir(tempProduct);
  console.dir(tmpData);

  const handleInputChange = (e, fn) => {
    const { name, value, type, checked } = e.target;

    fn((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const setArrayElementInput = (e, fn, index) => {
    const { name, value } = e.target;
    fn((prev) => {
      let newArray = [...prev[name]];
      newArray[index] = value;
      newArray = newArray.filter((url) => url.trim() !== "");
      if (newArray.length < 5) newArray.push("");
      return { ...prev, [name]: newArray };
    });
  };
  const addImage = () => {
    setTmpData((prev) => {
      let newArray = [...prev.imagesUrl].filter((url) => url.trim() !== "");
      if (newArray.length < 5) newArray.push("");
      return { ...prev, imagesUrl: newArray };
    });
  };
  const deleteImage = (index) => {
    setTmpData((prev) => {
      prev.imagesUrl.splice(index, 1);
      const newImages = [...prev.imagesUrl];
      return { ...prev, imagesUrl: newImages };
    });
  };
  const closeModal = () => {
    productModalRef.current.hide();
  };
  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file-to-upload", file);

      const response = await api.post(
        `/api${API_PATH}/admin/upload`,
        uploadFormData,
      );
      setTmpData((pre) => ({ ...pre, imageUrl: response.data.imageUrl }));
    } catch (error) {
      console.log(error.response.data.message);
    }
  };
  const updateProduct = async (e) => {
    e.preventDefault();
    const form = document.getElementById("productForm");

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const url = `/api${API_PATH}/admin/product/${
      modelMode === "create" ? "" : tmpData.id
    }`;
    const method = modelMode === "create" ? "post" : "put";
    const result = { ...tmpData };
    result.origin_price = Number(result.origin_price);
    result.price = Number(result.price);
    result.is_enabled = result.is_enabled ? 1 : 0;

    try {
      await api[method](url, { data: result });
      alert(`成功 ${modelMode === "create" ? "新增" : "更新"}`);
      closeModal();
      getProducts();
    } catch (error) {
      console.dir(error.response.data.message);
      alert("執行失敗：", error.response?.data?.message || error.message);
    }
  };
  const deleteProduct = async (e) => {
    e.preventDefault();
    try {
      await api.delete(`/api${API_PATH}/admin/product/${tmpData.id}`);
      getProducts();
      closeModal();
      alert("成功刪除！");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
      closeModal();
    }
  };
  return (
    <div
      ref={productModalRef}
      id="productModal"
      className="modal fade"
      tabIndex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0">
          <div
            className={`modal-header bg-${
              modelMode === "delete" ? "danger" : "dark"
            } text-white`}
          >
            <h5 id="productModalLabel" className="modal-title">
              <span>
                {modelMode === "delete"
                  ? "刪除產品"
                  : modelMode === "create"
                    ? "新增產品"
                    : "更新產品"}
              </span>
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <form id="productForm">
            <div className="modal-body">
              {modelMode === "delete" ? (
                <p className="fs-4">
                  確定要刪除：
                  <span className="text-danger">{tmpData.title}</span>
                </p>
              ) : (
                <div className="row">
                  <div className="col-sm-4">
                    <div className="mb-2">
                      <div className="mb-3">
                        <label
                          htmlFor="imagePath"
                          className="form-label  fw-bold"
                        >
                          主圖片採本地圖片上傳
                        </label>
                        <input
                          type="file"
                          name="imagePath"
                          id="imagePath"
                          className="form-control mb-1"
                          accept=".jpg, .jpeg, .png"
                          onChange={(e) => uploadImage(e)}
                        />
                      </div>
                      <div className="mb-2">
                        <label
                          htmlFor="imageUrl"
                          className="form-label  fw-bold"
                        >
                          主圖片網址
                        </label>
                        <input
                          type="text"
                          id="imageUrl"
                          name="imageUrl"
                          className="form-control"
                          placeholder="主圖片連結"
                          value={tmpData.imageUrl}
                          onChange={(e) => handleInputChange(e, setTmpData)}
                        />
                      </div>
                      {tmpData.imageUrl && (
                        <img
                          className="img-fluid mb-4"
                          src={tmpData.imageUrl}
                          alt=""
                        />
                      )}
                    </div>
                    {tmpData.imagesUrl.map((url, index) => (
                      <div className="mb-2" key={index}>
                        <div className="mb-2">
                          <label
                            htmlFor={`imagesUrl${index}`}
                            className="form-label fw-bold mb-1 mt-4"
                          >
                            副圖片網址{index + 1}
                          </label>
                          <button
                            className="btn btn-outline-danger btn-sm ms-3"
                            onClick={() => deleteImage(index)}
                          >
                            刪除
                          </button>
                          <input
                            type="text"
                            name="imagesUrl"
                            id={`imagesUrl${index}`}
                            className="form-control"
                            placeholder="請輸入圖片連結"
                            value={url}
                            onChange={(e) =>
                              setArrayElementInput(e, setTmpData, index)
                            }
                          />
                        </div>
                        {url.trim() && (
                          <img className="img-fluid" src={url.trim()} alt="" />
                        )}
                      </div>
                    ))}

                    <div>
                      <button
                        className="btn btn-outline-primary btn-sm d-block w-100 fw-bold"
                        onClick={addImage}
                        disabled={tmpData.imagesUrl.length >= 5}
                      >
                        新增副圖片
                      </button>
                    </div>
                    <div>
                      {/* <button className="btn btn-outline-danger btn-sm d-block w-100 fw-bold">
                      刪除圖片
                    </button> */}
                    </div>
                  </div>
                  <div className="col-sm-8">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label fw-bold">
                        標題
                      </label>
                      <input
                        id="title"
                        type="text"
                        name="title"
                        className="form-control"
                        placeholder="請輸入標題"
                        required
                        value={tmpData.title}
                        onChange={(e) => handleInputChange(e, setTmpData)}
                      />
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label
                          htmlFor="category"
                          className="form-label fw-bold"
                        >
                          分類
                        </label>
                        <input
                          id="category"
                          type="text"
                          name="category"
                          className="form-control"
                          placeholder="請輸入分類"
                          required
                          value={tmpData.category}
                          onChange={(e) => handleInputChange(e, setTmpData)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="unit" className="form-label fw-bold">
                          單位
                        </label>
                        <input
                          id="unit"
                          type="text"
                          name="unit"
                          className="form-control"
                          placeholder="請輸入單位"
                          required
                          value={tmpData.unit}
                          onChange={(e) => handleInputChange(e, setTmpData)}
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="mb-3 col-md-6">
                        <label
                          htmlFor="origin_price"
                          className="form-label fw-bold"
                        >
                          原價
                        </label>
                        <input
                          id="origin_price"
                          type="number"
                          min="0"
                          name="origin_price"
                          className="form-control"
                          placeholder="請輸入原價"
                          value={tmpData.origin_price}
                          onChange={(e) => handleInputChange(e, setTmpData)}
                        />
                      </div>
                      <div className="mb-3 col-md-6">
                        <label htmlFor="price" className="form-label fw-bold">
                          售價
                        </label>
                        <input
                          id="price"
                          type="number"
                          min="0"
                          name="price"
                          className="form-control"
                          placeholder="請輸入售價"
                          value={tmpData.price}
                          onChange={(e) => handleInputChange(e, setTmpData)}
                        />
                      </div>
                    </div>
                    <hr />

                    <div className="mb-3">
                      <label
                        htmlFor="description"
                        className="form-label fw-bold"
                      >
                        產品描述
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        className="form-control"
                        placeholder="請輸入產品描述"
                        value={tmpData.description}
                        onChange={(e) => handleInputChange(e, setTmpData)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="content" className="form-label fw-bold">
                        說明內容
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        className="form-control"
                        placeholder="請輸入說明內容"
                        value={tmpData.content}
                        onChange={(e) => handleInputChange(e, setTmpData)}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          id="is_enabled"
                          name="is_enabled"
                          className="form-check-input "
                          type="checkbox"
                          checked={tmpData.is_enabled}
                          onChange={(e) => handleInputChange(e, setTmpData)}
                        />
                        <label
                          className="form-check-label d-block text-start fw-bold"
                          htmlFor="is_enabled"
                        >
                          是否啟用
                        </label>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="rating" className="form-label fw-bold">
                        評比等級
                      </label>
                      <select
                        id="rating"
                        name="rating"
                        className="form-select"
                        aria-label="Default select example"
                        value={tmpData.rating}
                        onChange={(e) => handleInputChange(e, setTmpData)}
                      >
                        <option selected>點選評比等級</option>
                        <option value="1">1星</option>
                        <option value="2">2星</option>
                        <option value="3">3星</option>
                        <option value="4">4星</option>
                        <option value="5">5星</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                // data-bs-dismiss="modal"
                onClick={closeModal}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={(e) => {
                  if (modelMode === "delete") deleteProduct(e);
                  else updateProduct(e);
                }}
              >
                確認
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
