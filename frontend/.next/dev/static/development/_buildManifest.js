self.__BUILD_MANIFEST = {
  "/": [
    "static/chunks/pages/index.js"
  ],
  "/_error": [
    "static/chunks/pages/_error.js"
  ],
  "/auth/login": [
    "static/chunks/pages/auth/login.js"
  ],
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [],
    "fallback": []
  },
  "sortedPages": [
    "/",
    "/_app",
    "/_error",
    "/auth/login",
    "/dashboard",
    "/projects",
    "/projects/[projectId]",
    "/projects/[projectId]/analytics",
    "/projects/[projectId]/kanban",
    "/projects/[projectId]/tasks",
    "/projects/[projectId]/tasks/[taskId]"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()