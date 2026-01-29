-- Enes Editor kullanıcısını eklemek için SQL script
-- NOT: Bu script sadece kullanıcıyı oluşturur, şifre hash'lenmiş olmayacak
-- Şifreyi ayarlamak için backend'i yeniden başlatmak veya şifre sıfırlama endpoint'i kullanmak daha iyi

-- Önce kullanıcı var mı kontrol et
DO $$
DECLARE
    user_exists BOOLEAN;
    user_id UUID;
BEGIN
    -- Kullanıcı var mı kontrol et
    SELECT EXISTS(SELECT 1 FROM "AspNetUsers" WHERE "Email" = 'enes@gmail.com') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Yeni UUID oluştur
        user_id := gen_random_uuid();
        
        -- Kullanıcıyı ekle
        INSERT INTO "AspNetUsers" (
            "Id",
            "UserName",
            "NormalizedUserName",
            "Email",
            "NormalizedEmail",
            "EmailConfirmed",
            "PasswordHash",
            "SecurityStamp",
            "ConcurrencyStamp",
            "PhoneNumber",
            "PhoneNumberConfirmed",
            "TwoFactorEnabled",
            "LockoutEnabled",
            "AccessFailedCount",
            "FullName",
            "Department"
        ) VALUES (
            user_id,
            'enes@gmail.com',
            UPPER('enes@gmail.com'),
            'enes@gmail.com',
            UPPER('enes@gmail.com'),
            true,
            NULL, -- Şifre hash'i NULL - backend'den şifre sıfırlanmalı
            gen_random_uuid()::text,
            gen_random_uuid()::text,
            NULL,
            false,
            false,
            true,
            0,
            'Enes Editor',
            1 -- 1 = Nişan (Nisan)
        );
        
        -- Editor rolünü ekle
        INSERT INTO "AspNetUserRoles" ("UserId", "RoleId")
        SELECT user_id, r."Id"
        FROM "AspNetRoles" r
        WHERE r."Name" = 'Editor'
        AND NOT EXISTS (
            SELECT 1 FROM "AspNetUserRoles" ur 
            WHERE ur."UserId" = user_id AND ur."RoleId" = r."Id"
        );
        
        RAISE NOTICE 'Kullanıcı eklendi: enes@gmail.com (ID: %)', user_id;
        RAISE NOTICE 'NOT: Şifre henüz ayarlanmadı. Backend''i yeniden başlatın veya şifre sıfırlama endpoint''i kullanın.';
    ELSE
        RAISE NOTICE 'Kullanıcı zaten mevcut: enes@gmail.com';
    END IF;
END $$;

-- Kullanıcıyı kontrol et
SELECT "Id", "Email", "FullName", "Department" FROM "AspNetUsers" WHERE "Email" = 'enes@gmail.com';
