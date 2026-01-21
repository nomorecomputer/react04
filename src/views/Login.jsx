import { useState } from "react";
import { setCookie } from "../utility";
import { COOKIE_NAME, api } from "../App";

function Login({ setIsAuth, getProducts }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const handleInputChange = (e, fn) => {
    const { name, value, type, checked } = e.target;

    fn((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const signIn = async () => {
    try {
      const response = await api.post("/admin/signin", formData);
      const { token, expired } = response.data;

      setCookie(COOKIE_NAME, token, expired);
      api.defaults.headers.common["Authorization"] = token;
      setIsAuth(true);
      getProducts(1);
    } catch (error) {
      setIsAuth(false);
      alert(
        "登入失敗，請重新登入" + error.response?.data?.message || error.message,
      );
    }
  };
  return (
    <div className="container login">
      <div className="row justify-content-center">
        <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
        <div className="col-8">
          <form id="form" className="form-signin">
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                id="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={(e) => handleInputChange(e, setFormData)}
                required
                autoFocus
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                name="password"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange(e, setFormData)}
                required
              />
              <label htmlFor="password">Password</label>
            </div>
            <button
              className="btn btn-lg btn-primary w-100 mt-3"
              type="button"
              onClick={signIn}
            >
              登入
            </button>
          </form>
        </div>
      </div>
      <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
    </div>
  );
}

export default Login;
