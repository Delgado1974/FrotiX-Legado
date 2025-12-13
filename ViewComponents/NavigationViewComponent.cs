using FrotiX.Models;
using Microsoft.AspNetCore.Mvc;

namespace FrotiX.ViewComponents
    {
    public class NavigationViewComponent(INavigationModel navigationModel) : ViewComponent
        {
        private readonly INavigationModel _navigationModel = navigationModel;

        public IViewComponentResult Invoke()
            {
            var items = _navigationModel.Full;

            return View(items);
            }
        }
    }


