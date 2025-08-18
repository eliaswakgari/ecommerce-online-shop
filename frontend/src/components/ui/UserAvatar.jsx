import React from "react";

export default function UserAvatar({ user, size = "md", className = "" }) {
         const sizeClasses = {
                  sm: "w-8 h-8 text-sm",
                  md: "w-10 h-10 text-base",
                  lg: "w-12 h-12 text-lg",
                  xl: "w-16 h-16 text-xl"
         };

         const getInitials = (name) => {
                  return name
                           .split(' ')
                           .map(word => word.charAt(0))
                           .join('')
                           .toUpperCase()
                           .slice(0, 2);
         };

         if (user?.profileImage) {
                  return (
                           <img
                                    src={user.profileImage}
                                    alt={user.name}
                                    className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
                           />
                  );
         }

         return (
                  <div className={`rounded-full bg-blue-500 text-white flex items-center justify-center font-medium ${sizeClasses[size]} ${className}`}>
                           {getInitials(user?.name || "User")}
                  </div>
         );
}
