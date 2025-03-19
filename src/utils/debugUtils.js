export const debugFetch = async (url, options = {}) => {
  console.group("API Request Debug");
  console.log("URL:", url);
  console.log("Options:", options);

  try {
    const response = await fetch(url, options);
    const responseClone = response.clone();

    try {
      const data = await responseClone.json();
      console.log("Response:", {
        status: response.status,
        ok: response.ok,
        data,
      });
    } catch (e) {
      console.log("Response:", {
        status: response.status,
        ok: response.ok,
        body: await responseClone.text(),
      });
    }

    console.groupEnd();
    return response;
  } catch (error) {
    console.error("Fetch Error:", error);
    console.groupEnd();
    throw error;
  }
};
