const BACKEND_URL = "https://app.21luxuries.com/api";
let banners = [];

const fetchBanners = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/banners`);
    const fetchedBanners = await response.json();
    banners = fetchedBanners.banners;
    renderBanners(banners);
    // console.log('Fetched banners:', banners);
    return banners;
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
};

fetchBanners();

const renderBanners = (banners) => {
  const topBannerContainer = document.getElementById('top-banner');
  const bottomBannerContainer = document.getElementById('bottom-banner');

  // Clear existing
  topBannerContainer.innerHTML = '';
  bottomBannerContainer.innerHTML = '';

  // FILTER + LIMIT (max 4)
  const topBanners = banners
    .filter(b => b.position === 'top' && b.isActive)
    .slice(0, 4);

  const bottomBanners = banners
    .filter(b => b.position === 'bottom' && b.isActive)
    .slice(0, 4);

  const createBanner = (banner) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'banner';

    const img = document.createElement('img');
    img.src = banner.image;
    img.alt = banner.title || 'Banner Image';

    // Overlay container
    const overlay = document.createElement('div');
    overlay.className = 'banner-overlay';

    if (banner.title) {
      const title = document.createElement('h2');
      title.textContent = banner.title;
      overlay.appendChild(title);
    }

    if (banner.description) {
      const desc = document.createElement('span');
      desc.textContent = banner.description;
      overlay.appendChild(desc);
    }

    // Action button (ONLY this handles navigation)
    if (banner.action?.label && banner.action?.path) {
      const btn = document.createElement('button');
      btn.textContent = banner.action.label;
      btn.onclick = (e) => {
        e.stopPropagation(); // prevent parent click
        window.location.href = banner.action.path;
      };
      overlay.appendChild(btn);
    }

    wrapper.appendChild(img);
    wrapper.appendChild(overlay);

    return wrapper;
  };

  topBanners.forEach(b => topBannerContainer.appendChild(createBanner(b)));
  bottomBanners.forEach(b => bottomBannerContainer.appendChild(createBanner(b)));
};

// const renderBanners = (banners) => {
//   const topBannerContainer = document.getElementById('top-banner');
//   const bottomBannerContainer = document.getElementById('bottom-banner');
//   let topBanners = banners.filter(banner => banner.position === 'top');
//   topBanners.forEach(banner => {
//     const bannerLink = document.createElement('a');
//     bannerLink.href = banner.link;
//     const bannerImage = document.createElement('img');
//     bannerImage.src = banner.image;
//     bannerImage.alt = banner.altText || 'Banner Image';
//     bannerLink.appendChild(bannerImage);
//     topBannerContainer.appendChild(bannerLink);
//   });

//   let bottomBanners = banners.filter(banner => banner.position === 'bottom');
//   bottomBanners.forEach(banner => {
//     const bannerLink = document.createElement('a');
//     bannerLink.href = banner.action?.path || "#";
//     // bannerLink.href = banner.link;
//     const bannerImage = document.createElement('img');
//     bannerImage.src = banner.image;
//     bannerImage.alt = banner.altText || 'Banner Image';
//     bannerLink.appendChild(bannerImage);
//     bottomBannerContainer.appendChild(bannerLink);
//   });
// };