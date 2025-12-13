using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using FrotiX.Services;
using FrotiX.Validations;

namespace FrotiX.ViewModels
    {
    public class CustomViewModel
        {
        /* ---------------------------------------1---------------------------------*/
        /*
         * 
        More than on string should be separated by commas, it is automatically become required field.
        If you put ',' at the end of valid strings (eg: validStrings:"Yes,No,") than it will consider
        empty input as valid string and this field will become optional.
        Important Note: validStrings are not case sensitive
        *
        */
        [ValidateStrings(validStrings: "Yes,No,", ErrorMessage = "Please enter valid string.")]
        public string ValidateStringsInput { get; set; }


        /* ---------------------------------------2---------------------------------*/

        /*
         * 
        More than on string should be separated by commas, it is automatically become required field.
        If you put ',' at the end of valid strings (eg: validStrings:"Male,Female,Other,") than it will consider
        empty input as valid string and this field will become optional.
        Important Note: validStrings are case sensitive
        *
        */
        [ValidateStringsWithSensitivity(validStrings: "Male,Female,Other,", ErrorMessage = "Please enter valid string with case sensitivity.")]
        public string ValidateStringsWithSensitivityInput { get; set; }

        /* ---------------------------------------3---------------------------------*/

        [OnlyUrls(ErrorMessage = "Please enter valid url only.")]
        public string OnlyUrlsInput { get; set; }

        /* ---------------------------------------4---------------------------------*/

        [OnlyDigits(ErrorMessage = "Please enter digits only.")]
        public string OnlyDigitsInput { get; set; }

        /* ---------------------------------------5---------------------------------*/

        [OnlyCharacters(ErrorMessage = "Only characters are allowed.")]
        public string OnlyCharactersInput { get; set; }

        /* ---------------------------------------6---------------------------------*/

        [UpperCase(ErrorMessage = "Only Upercase Characters are allowed.")]
        public string UpperCaseInput { get; set; }

        /* ---------------------------------------7---------------------------------*/

        [LowerCase(ErrorMessage = "Only Lowercase Characters are allowed.")]
        public string LowerCaseInput { get; set; }

        /* ---------------------------------------8---------------------------------*/

        /*
         *
         For valid date formats please see below links :
         https://www.c-sharpcorner.com/blogs/date-and-time-format-in-c-sharp-programming1
         https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings

         You can also use date picker on front end / View,
         If date format is not correct, it will show you the error message after validating the input.
         *
         */

        [ValidateDate(dateFormat: "MM/dd/yyyy")]
        [Display(Name = "Valid Date")] // Valid Date is Used  as alternative of ValidateDateInput in error message.
        public string ValidateDateInput { get; set; }

        /* ---------------------------------------9---------------------------------*/

        /*
        *
        For valid date formats please see below links :
        https://www.c-sharpcorner.com/blogs/date-and-time-format-in-c-sharp-programming1
        https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings

        You can also use date picker on front end / View,
        If date format is not correct, it will show you the error message after validating the input.
        Also, set the date range as per your requement.
        *
        */

        [DateRange(dateFormat: "MM/dd/yyyy", from: "09/01/2019", to: "10/25/2020")]
        [Display(Name = "Date Range")]
        public string DateRangeInput { get; set; }

        /* ---------------------------------------10---------------------------------*/

        /*
        *
        This will check if a string or domain passed in to the domainValue comes at the end of entered user input.
        If not, than it  shows the error message. This is helpful in validating the domains, subdomains, emails, etc.
        *
        */

        [ValidateDomainAtEnd(domainValue: "camara.leg.br")]
        [Display(Name = "Validate Domain")]
        public string ValidateDomainAtEndInput { get; set; }


        /* ---------------------------------------11---------------------------------*/

        /*
        *
        This will check if a string or domain passed in to the domainValue should contain (at any position) in the input, entered by user.
        If not, than it  shows the error message. This is helpful in validating the domains urls, long strings, etc.
        *
        */
        [ValidDomainAnyWhere(domainValue: "google.com")]
        [Display(Name = "Validate Domain")]
        public string ValidDomainAnyWhereInput { get; set; }

        /* ---------------------------------------12---------------------------------*/

        [NumOrChars]
        [Display(Name = "Numbers or Characters")]
        public string NumOrCharsInput { get; set; }

        /* ---------------------------------------13---------------------------------*/

        // Validate decimals upto 2 decimals places.
        [ValidateDecimals]
        [Display(Name = "Decimals")]
        public string ValidateDecimalsInput { get; set; }

        /* ---------------------------------------14---------------------------------*/

        // Validate amount upto 3 decimals places.
        [ValidateAmount]
        [Display(Name = "Amount")]
        public string ValidateAmountInput { get; set; }

        /* ---------------------------------------15---------------------------------*/

        // If person is less than 10 years old from today than validation message will appear.
        [ValidateMinAge(dateFormat: "MM/dd/yyyy", minAge: "10")]
        [Display(Name = "Date of Birth")]
        public string ValidateMinAgeInput { get; set; }

        /* ---------------------------------------16---------------------------------*/

        // If person is less than 10 years old from givenDate than validation message will appear.
        [ValidateMinAgeWithGivenDate(dateFormat: "MM/dd/yyyy", minAge: "10", givenDate: "03/01/2019")]
        [Display(Name = "Date of Birth")]
        public string ValidateMinAgeWithGivenDateInput { get; set; }

        /* --------------------------------------------------------------------------*/
        /* --------------------------------------------------------------------------*/
        /* --------------------------------------------------------------------------*/






        }
    }


