# Validating Resources

Monokle automatically validates all resources of the corresponding Kubernetes 1.22.1 schemas. In the Navigator, a resource which is not validated is shown with a red error icon. A resource with a broken link is shown with a yellow triangle. 

![Resource Validation](img/link-syntax-errors-image-1-1.5.0.png)

## **Inspecting Link and Syntax Validation Errors**

You will see the number of both link and syntax validation errors in resources at the top of the Navigator:

![Link and Syntax Errors](img/navigator-link-and-syntax-errors-header-1.6.0.png)

Click on the yellow triangle to see a list of the broken links in the current resources:

![Link Errors](img/navigator-broken-links-list-1.6.0.png)

Click on the red circle to see a list of syntax errors in the current resources:

![Syntax Errors](img/navigator-syntax-errors-list-1.6.0.png)

Clicking on any item in the broken link or syntax error list will locate the file where the error exits in the Navigator and open the source in the Editor.  

This same functionality is available when the error icons are next to the file names in the Navigator:

![Link and Syntax Icons](img/navigator-link-syntax-errors-1.6.0.png)

Hover on the error icon to check the error details and see the corresponding line in the Editor:

![Resource Error Popup](img/error-details-popup-1.5.0.png)