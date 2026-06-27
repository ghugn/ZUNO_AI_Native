'use client';

import React, { useState } from 'react';
import Button from './Button'; 
import { apiFetch, setStoredToken } from '@/lib/api/client';

interface AuthFormProps {
  onAuthSuccess: (username: string) => void;
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Vui lòng điền đầy đủ thông tin bạn ơi!');
      return;
    }

    const isMockMode = process.env.NEXT_PUBLIC_API_MODE === 'memory-mock';
    if (isMockMode) {
      setStoredToken('mock-token', 'user_demo');
      onAuthSuccess(isLogin ? 'Zuno User' : name);
      return;
    }

    try {
      if (isLogin) {
        const response = await apiFetch<{ token: string; user: { id: string; fullName: string } }>('/api/auth/login', {
          method: 'POST',
          skipAuth: true,
          body: { email, password },
        });

        if (response.ok) {
          setStoredToken(response.data.token, response.data.user.id);
          onAuthSuccess(response.data.user.fullName || 'User');
        } else {
          setError(response.error || 'Sai Email hoặc Mật khẩu rồi!');
        }
      } else {
        const response = await apiFetch<{ token: string; user: { id: string; fullName: string } }>('/api/auth/register', {
          method: 'POST',
          skipAuth: true,
          body: { email, password, fullName: name },
        });

        if (response.ok) {
          setStoredToken(response.data.token, response.data.user.id);
          
          // Khởi tạo các tài nguyên mặc định cho người dùng mới qua API
          await apiFetch('/api/profile', {
            method: 'POST',
            body: {
              fullName: name,
              bankBalance: 0,
              residenceType: 'dorm',
            },
          });
          // Gọi onAuthSuccess luôn thay vì chuyển sang bước 2
          onAuthSuccess(name);
        } else {
          setError(response.error || 'Đăng ký thất bại. Email có thể đã tồn tại!');
        }
      }
    } catch (err: any) {
      setError('Lỗi kết nối Server. Vui lòng thử lại sau!');
    }
  };

  return (
    <div className="w-full max-w-sm p-6 bg-white rounded-3xl shadow-xs border border-slate-100 flex flex-col gap-5">
      {/* Tiêu đề Form */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900">
          {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản Zuno'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isLogin ? 'Quản lý chi tiêu chánh niệm cùng AI' : 'Bắt đầu hành trình làm chủ ví tiền sinh viên'}
        </p>
      </div>

      {/* Form điền thông tin */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Ô nhập tên nếu là Đăng ký */}
        {!isLogin && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-600 pl-1">Tên hiển thị</label>
            <input
              type="text"
              placeholder="Ví dụ: Trung HUST"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-slate-900 transition-all bg-slate-50"
            />
          </div>
        )}

        {/* Ô nhập Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-600 pl-1">Email của bạn</label>
          <input
            type="email"
            placeholder="username@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-slate-900 transition-all bg-slate-50"
          />
        </div>

        {/* Ô nhập Mật khẩu */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-600 pl-1">Mật khẩu</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-slate-900 transition-all bg-slate-50"
          />
        </div>

        {/* Thông báo lỗi nếu gõ sai */}
        {error && <p className="text-xs text-co-che-do font-semibold pl-1">{error}</p>}

        {/* Nút bấm Submit */}
        <Button variant="primary" type="submit" className="w-full mt-2 py-3">
          {isLogin ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}
        </Button>
      </form>

      {/* Nút chuyển đổi trạng thái Đăng nhập / Đăng ký */}
      <div className="text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
        >
          {isLogin ? 'Bạn chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản rồi? Đăng nhập'}
        </button>
      </div>
    </div>
  );
}