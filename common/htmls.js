const _ = require("lodash");

exports.getShopRegisterHtml = (data) => {
  return `<div>
  <h4>Personal Info</h4>
  <div>
    <div>
      <label>User Name</label>
      <input disabled type="text" value="${data.user_name}" />
    </div>
    <div>
      <label>User Email</label>
      <input disabled type="email" value="${data.email}" />
    </div>
    <div>
      <label>User Password</label>
      <input disabled type="text" value="${data.password}"/>
    </div>
  </div>
</div>
<div>
  <h4>Basic Info</h4>
  <div>
    <div>
      <label>Shop Name</label>
      <input disabled type="text" value="${data.password}"/>
    </div>
    <div>
      <label>Address</label>
      <ul>
      ${
        data.address
          ? data.address.building_name
            ? `<li>Building Name: ${data.address.building_name}</li>`
            : ""
          : ""
      }
      ${
        data.address
          ? data.address.street
            ? `<li>Street: ${data.address.street}</li>`
            : ""
          : ""
      }
      ${
        data.address
          ? data.address.city
            ? `<li>City: ${data.address.city}</li>`
            : ""
          : ""
      }
      </ul>
    </div>
    <div>
      <label>Pickup Point</label>
      <input disabled type="text" value="${data.pickup_point}"/>
    </div>
    <div>
      <label>Mobile</label>
      <input disabled type="text" value="${data.mobile}"/>
    </div>
    <div>
      <label>Language</label>
      <input disabled type="text" value="${
        data.language ? data.language : "en"
      }"/>
    </div>
  </div>
</div>

  `;
};
